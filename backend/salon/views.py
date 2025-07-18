from rest_framework import generics, permissions, status, views
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, login
from django.db.models import Count, Sum, F
from django.utils import timezone
from datetime import timedelta

from .models import User, Service, Stylist, Appointment, Review, Promotion, LoyaltyPoint, SalonSetting
from .serializers import (
    UserSerializer, RegisterSerializer, LoginSerializer, ServiceSerializer,
    StylistSerializer, AppointmentSerializer, ReviewSerializer, PromotionSerializer,
    LoyaltyPointSerializer, SalonSettingSerializer, PasswordResetSerializer,
    PasswordResetConfirmSerializer
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


# --- Service Views ---

class ServiceListCreateView(generics.ListCreateAPIView):
    queryset = Service.objects.filter(is_active=True)
    serializer_class = ServiceSerializer
    permission_classes = (permissions.AllowAny,) # Explicitly allow any for list

class ServiceDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = (IsAdminOrReadOnly,)


# --- Stylist Views ---

class StylistListCreateView(generics.ListCreateAPIView):
    queryset = Stylist.objects.filter(is_available=True)
    serializer_class = StylistSerializer
    permission_classes = (permissions.AllowAny,) # Explicitly allow any for list

class StylistDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Stylist.objects.all()
    serializer_class = StylistSerializer
    permission_classes = (IsAdminOrReadOnly,) # Changed from IsStylistOrAdmin

    def get_queryset(self):
        # Allow stylists to view/update their own profile
        # This method might not be strictly needed here anymore with IsAdminOrReadOnly
        # but keeping it for context if specific stylist self-management is desired.
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
        elif user.role == 'customer':
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

        service = serializer.validated_data['service']
        
        # We pass the customer directly to the serializer's save method.
        # The validation logic is now correctly handled within the serializer itself.
        serializer.save(customer=customer, duration_minutes=service.duration_minutes, status='pending')

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
            # If rescheduling, check stylist availability
            if 'appointment_date' in serializer.validated_data or 'appointment_time' in serializer.validated_data:
                stylist = instance.stylist
                new_date = serializer.validated_data.get('appointment_date', instance.appointment_date)
                new_time = serializer.validated_data.get('appointment_time', instance.appointment_time)
                if Appointment.objects.exclude(pk=instance.pk).filter(
                    stylist=stylist,
                    appointment_date=new_date,
                    appointment_time=new_time,
                    status__in=['pending', 'approved', 'rescheduled']
                ).exists():
                    raise serializers.ValidationError({"detail": "The requested reschedule time slot is not available."})
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
                # Get the service price from the appointment instance
                service_price = serializer.instance.service.price
                # Calculate points: 1 point for every 100 shillings
                points_to_add = int(service_price / 100)

                if points_to_add > 0: # Only add points if there are any to add
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
    permission_classes = (permissions.AllowAny,) # Explicitly allow any for list

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
        # Customers can only view their own loyalty points
        if self.request.user.role == 'customer':
            try:
                return LoyaltyPoint.objects.get(customer=self.request.user)
            except LoyaltyPoint.DoesNotExist:
                raise generics.ValidationError("Loyalty points not found for this user.")
        # Admin can view any loyalty points by pk
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

        # Define the redemption rate: e.g., 100 points = 1 unit of discount (e.g., $1 or KSh 1)
        # You can make this configurable via SalonSetting if needed.
        redemption_rate_per_unit = 100  # 100 points = 1 unit of currency (e.g., 1 KSh or 1 USD)

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
        # Monthly & annual number of customers
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

        # Service performance (most/least booked)
        service_performance = Appointment.objects.filter(
            status__in=['completed']
        ).values('service__name').annotate(count=Count('service__name')).order_by('-count')

        # Revenue insights (if payment data is available)
        # This assumes a 'price' field on the Appointment model, or linkage to a Payment model.
        # For simplicity, we'll use the service price at the time of booking if available.
        total_revenue = Appointment.objects.filter(
            status='completed'
        ).aggregate(total_revenue=Sum(F('service__price')))

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
