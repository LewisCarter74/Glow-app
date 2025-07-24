from rest_framework import generics, permissions, status, views
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, login
from django.db.models import Count, Sum, F, Avg # Import Avg for popularity
from django.utils import timezone
from datetime import timedelta, datetime, time
from django.db.models import Q

# Import filter backends for DRF
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter # Import OrderingFilter

from .models import User, Service, Stylist, Appointment, Review, Promotion, LoyaltyPoint, SalonSetting, Category # Import Category
from .serializers import (
    UserSerializer, RegisterSerializer, LoginSerializer, ServiceSerializer,
    StylistSerializer, AppointmentSerializer, ReviewSerializer, PromotionSerializer,
    LoyaltyPointSerializer, SalonSettingSerializer, PasswordResetSerializer,
    PasswordResetConfirmSerializer, AIStyleRecommendationInputSerializer,
    AIRecommendationResponseSerializer, CategorySerializer # Import CategorySerializer
)
from .permissions import IsAdminOrReadOnly, IsOwnerOrAdmin, IsStylistOrAdmin, IsCustomerOrAdmin


# --- Authentication Views ---

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

    def perform_create(self, serializer):
        user = serializer.save()
        # If a new customer registers, create a LoyaltyPoint entry for them
        # This ensures every customer has a LoyaltyPoint record for manual management
        if user.role == 'customer':
            LoyaltyPoint.objects.get_or_create(customer=user, defaults={'points': 0})


class LoginView(views.APIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        login(request, user)
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data,
        }, status=status.HTTP_200_OK)

class UserProfileView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = (IsOwnerOrAdmin,)

    def get_object(self):
        return self.request.user

class PasswordResetView(views.APIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = PasswordResetSerializer

    def post(self, request, *args, **kwargs):
        # In a real application, this would send an email with a reset link
        # For now, we'll just acknowledge the request.
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        # Here you would typically generate a token and email it to the user
        # For simplicity, we'll just return a success message.
        return Response({'detail': 'Password reset link sent to your email (feature not fully implemented).',
                         'email': email}, status=status.HTTP_200_OK)

class PasswordResetConfirmView(views.APIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = PasswordResetConfirmSerializer

    def post(self, request, *args, **kwargs):
        # In a real application, this would validate uid and token and set new password
        # For now, we'll just acknowledge the request.
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        uid = serializer.validated_data['uid']
        token = serializer.validated_data['token']
        new_password = serializer.validated_data['new_password']
        # Logic to decode uid, validate token, find user and set new password
        # For simplicity, returning a success message.
        return Response({'detail': 'Password has been reset successfully (feature not fully implemented).',
                         'uid': uid, 'token': token}, status=status.HTTP_200_OK)


# --- Category Views (New) ---
class CategoryListCreateView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = (permissions.AllowAny,)

class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = (IsAdminOrReadOnly,)


# --- Service Views ---

class ServiceListCreateView(generics.ListCreateAPIView):
    serializer_class = ServiceSerializer
    permission_classes = (permissions.AllowAny,)
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['price', 'duration_minutes', 'average_rating']

    def get_queryset(self):
        queryset = Service.objects.filter(is_active=True).annotate(average_rating=Avg('appointment__review__rating'))
        
        # Custom filtering for category name
        category_name = self.request.query_params.get('category', None)
        if category_name is not None:
            queryset = queryset.filter(category__name__iexact=category_name)

        # Custom filtering for duration and price
        duration_lte = self.request.query_params.get('duration_minutes__lte', None)
        if duration_lte is not None:
            queryset = queryset.filter(duration_minutes__lte=duration_lte)

        duration_gte = self.request.query_params.get('duration_minutes__gte', None)
        if duration_gte is not None:
            queryset = queryset.filter(duration_minutes__gte=duration_gte)

        price_lte = self.request.query_params.get('price__lte', None)
        if price_lte is not None:
            queryset = queryset.filter(price__lte=price_lte)

        price_gte = self.request.query_params.get('price__gte', None)
        if price_gte is not None:
            queryset = queryset.filter(price__gte=price_gte)
            
        return queryset


class ServiceDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = (IsAdminOrReadOnly,)


# --- Stylist Views ---

class StylistListCreateView(generics.ListCreateAPIView):
    serializer_class = StylistSerializer
    permission_classes = (permissions.AllowAny,)

    def get_queryset(self):
        queryset = Stylist.objects.filter(is_available=True).prefetch_related('specialties')
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(specialties__name__iexact=category)
        return queryset

class StylistDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Stylist.objects.all()
    serializer_class = StylistSerializer
    permission_classes = (IsAdminOrReadOnly,) 

    def get_queryset(self):
        if self.request.user.is_authenticated and self.request.user.role == 'stylist':
            return Stylist.objects.filter(user=self.request.user)
        return super().get_queryset()


# --- Appointment Views ---

class AppointmentListCreateView(generics.ListCreateAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Appointment.objects.all()
        elif user.role == 'customer': # Fixed typo here
            return Appointment.objects.filter(customer=user)
        elif user.role == 'stylist':
            try:
                stylist = Stylist.objects.get(user=user)
                return Appointment.objects.filter(stylist=stylist)
            except Stylist.DoesNotExist:
                return Appointment.objects.none() # Stylist user but no Stylist profile linked
        return Appointment.objects.none()

    def perform_create(self, serializer):
        customer = self.request.user
        if customer.role != 'customer':
            raise serializers.ValidationError("Only customers can create appointments.")

        # The heavy lifting of validation (stylist availability, time conflicts)
        # is now handled in the serializer's .validate() method.
        # The serializer should return validated_data with 'stylist' and 'services' objects.

        services = serializer.validated_data['services']
        total_duration = sum(s.duration_minutes for s in services) # Calculate total duration from selected services
        
        serializer.save(customer=customer, duration_minutes=total_duration, status='pending')

class AppointmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = (IsOwnerOrAdmin,)

    def perform_update(self, serializer):
        instance = self.get_object()
        user = self.request.user

        # Customer can only reschedule or cancel their own pending/approved appointments
        if user.role == 'customer':
            if instance.customer != user:
                raise permissions.PermissionDenied("You do not have permission to modify this appointment.")
            if instance.status not in ['pending', 'approved']:
                raise serializers.ValidationError("Only pending or approved appointments can be rescheduled or cancelled.")
            if 'status' in serializer.validated_data and serializer.validated_data['status'] not in ['cancelled', 'rescheduled']:
                raise serializers.ValidationError("Customers can only change status to cancelled or rescheduled.")
            
            # Recalculate duration if services are being changed
            # The serializer's validate method will re-run its availability checks if fields change.
            # We just need to ensure the duration_minutes is correctly set for the instance before saving.
            if 'service_ids' in serializer.validated_data: # If services are changing
                new_service_ids = serializer.validated_data['service_ids']
                new_services = Service.objects.filter(id__in=new_service_ids)
                total_duration = sum(s.duration_minutes for s in new_services)
                serializer.validated_data['duration_minutes'] = total_duration

            serializer.save()

        # Stylist/Admin can manage all aspects (approve/reject/complete/etc.)
        elif user.role in ['stylist', 'admin']:
            if user.role == 'stylist':
                try:
                    stylist_profile = Stylist.objects.get(user=user)
                    if instance.stylist != stylist_profile:
                        raise permissions.PermissionDenied("You do not have permission to modify this appointment.")
                except Stylist.DoesNotExist:
                    raise permissions.PermissionDenied("Stylist profile not found.")
            serializer.save()

            # Loyalty points logic for completed appointments (Re-added)
            if serializer.instance.status == 'completed' and instance.status != 'completed':
                service_price = sum(service.price for service in serializer.instance.services.all()) 
                points_to_add = int(service_price / 100)

                if points_to_add > 0: 
                    loyalty_points, created = LoyaltyPoint.objects.get_or_create(customer=instance.customer)
                    loyalty_points.points += points_to_add
                    loyalty_points.save()

    def perform_destroy(self, instance):
        user = self.request.user
        if user.role == 'customer' and instance.status not in ['pending', 'approved']:
            raise serializers.ValidationError("Only pending or approved appointments can be cancelled by customer.")
        elif user.role == 'stylist' and instance.stylist.user != user:
            raise permissions.PermissionDenied("You do not have permission to delete this appointment.")
        instance.delete()


# --- Review Views ---

class ReviewListCreateView(generics.ListCreateAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    def perform_create(self, serializer):
        customer = self.request.user
        appointment = serializer.validated_data['appointment']

        if customer.role != 'customer':
            raise serializers.ValidationError("Only customers can leave reviews.")

        if appointment.customer != customer:
            raise serializers.ValidationError("You can only review your own appointments.")

        if appointment.status != 'completed':
            raise serializers.ValidationError("Reviews can only be left for completed appointments.")

        if Review.objects.filter(appointment=appointment, customer=customer).exists():
            raise serializers.ValidationError("You have already reviewed this appointment.")

        serializer.save(customer=customer, stylist=appointment.stylist)

class ReviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = (IsOwnerOrAdmin,)


# --- Promotion Views ---

class PromotionListCreateView(generics.ListCreateAPIView):
    queryset = Promotion.objects.filter(is_active=True, valid_until__gte=timezone.now())
    serializer_class = PromotionSerializer
    permission_classes = (permissions.AllowAny,) 

class PromotionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Promotion.objects.all()
    serializer_class = PromotionSerializer
    permission_classes = (IsAdminOrReadOnly,)


# --- Loyalty Point Views ---

class LoyaltyPointView(generics.RetrieveAPIView):
    queryset = LoyaltyPoint.objects.all()
    serializer_class = LoyaltyPointSerializer
    permission_classes = (IsOwnerOrAdmin,)

    def get_object(self):
        if self.request.user.role == 'customer':
            try:
                return LoyaltyPoint.objects.get(customer=self.request.user)
            except LoyaltyPoint.DoesNotExist:
                raise generics.ValidationError("Loyalty points not found for this user.")
        return super().get_object()

class LoyaltyPointRedeemView(views.APIView):
    permission_classes = (IsCustomerOrAdmin,)

    def post(self, request, *args, **kwargs):
        customer = request.user
        if customer.role != 'customer':
            return Response({'detail': 'Only customers can redeem loyalty points.'}, status=status.HTTP_403_FORBIDDEN)

        try:
            loyalty_points = LoyaltyPoint.objects.get(customer=customer)
        except LoyaltyPoint.DoesNotExist:
            return Response({'detail': 'No loyalty points found.'}, status=status.HTTP_404_NOT_FOUND)

        redeem_amount = request.data.get('redeem_amount')
        if not isinstance(redeem_amount, (int, float)) or redeem_amount <= 0:
            return Response({'detail': 'Invalid redeem amount. Must be a positive number.'}, status=status.HTTP_400_BAD_REQUEST)

        redemption_rate_per_unit = 100  

        if loyalty_points.points < redeem_amount:
            return Response({'detail': 'Insufficient loyalty points.'}, status=status.HTTP_400_BAD_REQUEST)

        discount_value = redeem_amount / redemption_rate_per_unit

        loyalty_points.points -= redeem_amount
        loyalty_points.save()

        return Response({
            'detail': f'{redeem_amount} points redeemed. Equivalent to {discount_value:.2f} discount.',
            'remaining_points': loyalty_points.points
        }, status=status.HTTP_200_OK)


# --- Analytics Views ---

class AnalyticsView(views.APIView):
    permission_classes = (permissions.IsAdminUser,)

    def get(self, request, *args, **kwargs):
        current_year = timezone.now().year
        current_month = timezone.now().month

        monthly_customers = Appointment.objects.filter(
            appointment_date__year=current_year,
            appointment_date__month=current_month,
            status__in=['completed']
        ).values('customer__email').distinct().count()

        annual_customers = Appointment.objects.filter(
            appointment_date__year=current_year,
            status__in=['completed']
        ).values('customer__email').distinct().count()

        # Corrected for Service to Category change
        service_performance = Appointment.objects.filter(
            status__in=['completed']
        ).values('services__category__name').annotate(count=Count('services__category__name')).order_by('-count')

        total_revenue = Appointment.objects.filter(
            status='completed'
        ).aggregate(total_revenue=Sum(F('services__price')))

        return Response({
            'monthly_customers': monthly_customers,
            'annual_customers': annual_customers,
            'service_performance': service_performance,
            'total_revenue': total_revenue['total_revenue'] or 0.00,
        }, status=status.HTTP_200_OK)


# --- Salon Settings View ---
class SalonSettingListCreateView(generics.ListCreateAPIView):
    queryset = SalonSetting.objects.all()
    serializer_class = SalonSettingSerializer
    permission_classes = (permissions.IsAdminUser,)

class SalonSettingDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = SalonSetting.objects.all()
    serializer_class = SalonSettingSerializer
    permission_classes = (permissions.IsAdminUser,)


# --- AI Features ---

def get_ai_recommendation(preferences: str = None, image_file = None, request=None):
    """
    Placeholder function to simulate AI style recommendation.
    In a real application, this would interact with an actual AI model.
    """
    recommendations = []

    if preferences and "short" in preferences.lower():
        recommendations.append({
            "description": "A chic bob cut would suit your preferences for a short style.",
            "imageUrl": request.build_absolute_uri('/media/ai_recommendations/bob_cut.jpg') if request else "https://placehold.co/1200x800",
            "specialistId": None 
        })
    elif preferences and "long" in preferences.lower():
        recommendations.append({
            "description": "Consider long, flowing waves for an elegant and versatile look.",
            "imageUrl": request.build_absolute_uri('/media/ai_recommendations/long_waves.jpg') if request else "https://placehold.co/1200x800",
            "specialistId": None
        })
    elif preferences and "braids" in preferences.lower():
        recommendations.append({
            "description": "Box braids or cornrows could be a great protective and stylish option.",
            "imageUrl": request.build_absolute_uri('/media/ai_recommendations/box_braids.jpg') if request else "https://placehold.co/1200x800",
            "specialistId": None
        })
    elif image_file:
        recommendations.append({
            "description": "Based on your image, a classic updo would enhance your features.",
            "imageUrl": request.build_absolute_uri('/media/ai_recommendations/updo.jpg') if request else "https://placehold.co/1200x800",
            "specialistId": None
        })
    else:
        recommendations.append({
            "description": "Discover a fresh new look! Try a layered cut with highlights.",
            "imageUrl": request.build_absolute_uri('/media/ai_recommendations/layered_highlights.jpg') if request else "https://placehold.co/1200x800",
            "specialistId": None
        })
    
    return recommendations


class AIStyleRecommendationView(views.APIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = AIStyleRecommendationInputSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        preferences = serializer.validated_data.get('preferences')
        image = serializer.validated_data.get('image')

        ai_output = get_ai_recommendation(preferences=preferences, image_file=image, request=request)

        response_serializer = AIRecommendationResponseSerializer(data={'recommendations': ai_output})
        response_serializer.is_valid(raise_exception=True)

        return Response(response_serializer.data, status=status.HTTP_200_OK)
class AppointmentAvailabilityView(views.APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request, *args, **kwargs):
        date_str = request.query_params.get('date')
        service_ids_str = request.query_params.get('service_ids')

        if not date_str or not service_ids_str:
            return Response({"detail": "Date and service IDs are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            appointment_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            service_ids = [int(sid) for sid in service_ids_str.split(',')]
        except (ValueError, TypeError):
            return Response({"detail": "Invalid date or service ID format."}, status=status.HTTP_400_BAD_REQUEST)

        services = Service.objects.filter(id__in=service_ids)
        if len(services) != len(service_ids):
            return Response({"detail": "One or more services not found."}, status=status.HTTP_404_NOT_FOUND)

        total_duration = sum(s.duration_minutes for s in services)
        required_categories = {s.category for s in services}

        available_stylists = Stylist.objects.filter(
            is_available=True,
            specialties__in=list(required_categories)
        ).distinct()

        salon_start_time = time(9, 0)
        salon_end_time = time(18, 0)
        time_slot_interval = 30 
        
        available_slots = []
        current_time = datetime.combine(appointment_date, salon_start_time)
        end_of_day = datetime.combine(appointment_date, salon_end_time)

        while current_time < end_of_day:
            slot_time = current_time.time()
            
            for stylist in available_stylists:
                is_slot_available_for_stylist = not Appointment.objects.filter(
                    stylist=stylist,
                    appointment_date=appointment_date,
                    appointment_time__lt=(datetime.combine(appointment_date, slot_time) + timedelta(minutes=total_duration)).time(),
                    status__in=['pending', 'approved', 'rescheduled']
                ).annotate(
                    end_time=F('appointment_time') + F('duration_minutes') * timedelta(minutes=1)
                ).filter(
                    end_time__gt=slot_time
                ).exists()

                if is_slot_available_for_stylist:
                    available_slots.append(slot_time.strftime('%H:%M'))
                    break 

            current_time += timedelta(minutes=time_slot_interval)

        return Response(sorted(list(set(available_slots))), status=status.HTTP_200_OK)
