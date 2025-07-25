# glow-app/backend/salon/views.py

from django.shortcuts import render
from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from .models import (
    User, Service, Stylist, Appointment, Review, Promotion,
    LoyaltyPoint, FavoriteStylist, Category, Referral, InspiredWork
)
from .serializers import (
    UserSerializer, RegisterSerializer, LoginSerializer,
    ServiceSerializer, StylistSerializer, AppointmentSerializer, ReviewSerializer,
    PromotionSerializer, LoyaltyPointSerializer, FavoriteStylistSerializer,
    CategorySerializer, PasswordResetSerializer, PasswordResetConfirmSerializer,
    ReferralSerializer, InspiredWorkSerializer
)
from django.contrib.auth import get_user_model
from django.utils.http import urlsafe_base64_decode
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.urls import reverse
from django.conf import settings
from .permissions import IsOwnerOrAdmin, IsAdminOrReadOnly, IsAdminOrStylist, IsOwner
from rest_framework.decorators import action
from django.db.models import Avg, Count
from datetime import date, datetime, timedelta, time
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.db import transaction
import pytz
from django.db.models import Q


class InspiredWorkViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and managing inspired work images.
    """
    queryset = InspiredWork.objects.all().order_by('-created_at')
    serializer_class = InspiredWorkSerializer
    permission_classes = [IsAdminOrReadOnly]


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

class LoginView(generics.GenericAPIView):
    serializer_class = LoginSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data
        })

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.filter(is_active=True).order_by('name')
    serializer_class = ServiceSerializer
    permission_classes = [IsAdminOrReadOnly]

class StylistViewSet(viewsets.ModelViewSet):
    queryset = Stylist.objects.select_related('user').prefetch_related('specialties').all().order_by('id')
    serializer_class = StylistSerializer
    permission_classes = [IsAdminOrReadOnly]

    @swagger_auto_schema(
        method='get',
        manual_parameters=[
            openapi.Parameter('service_id', openapi.IN_QUERY, description="ID of the service to filter by", type=openapi.TYPE_INTEGER),
        ]
    )
    @action(detail=False, methods=['get'], url_path='available-for-service')
    def available_for_service(self, request):
        service_id = request.query_params.get('service_id')
        if not service_id:
            return Response({"error": "service_id parameter is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            service = Service.objects.get(id=service_id)
        except Service.DoesNotExist:
            return Response({"error": "Service not found"}, status=status.HTTP_404_NOT_FOUND)

        stylists = Stylist.objects.filter(
            is_available=True,
            specialties=service.category
        ).distinct()
        
        serializer = self.get_serializer(stylists, many=True)
        return Response(serializer.data)

class AppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Appointment.objects.all()
        elif user.role == 'stylist':
            return Appointment.objects.filter(stylist__user=user)
        return Appointment.objects.filter(customer=user)

    def perform_create(self, serializer):
        appointment = serializer.save(customer=self.request.user)
        # Logic to award loyalty points on completion is in perform_update

    def perform_update(self, serializer):
        instance = self.get_object()
        original_status = instance.status
        updated_appointment = serializer.save()
        
        # Award loyalty points when an appointment is marked as 'completed'
        if original_status != 'completed' and updated_appointment.status == 'completed':
            self.award_loyalty_points(updated_appointment)

    def award_loyalty_points(self, appointment):
        customer = appointment.customer
        points_to_award = int(appointment.total_price) # Example: 1 point per dollar spent
        loyalty_points, created = LoyaltyPoint.objects.get_or_create(customer=customer)
        loyalty_points.points += points_to_award
        loyalty_points.save()


    @action(detail=True, methods=['post'], permission_classes=[IsOwner])
    def cancel(self, request, pk=None):
        appointment = self.get_object()
        if appointment.status in ['pending', 'approved']:
            appointment.status = 'cancelled'
            appointment.save()
            return Response({'status': 'Appointment cancelled'}, status=status.HTTP_200_OK)
        return Response({'error': 'This appointment cannot be cancelled.'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], url_path='availability')
    def availability(self, request):
        date_str = request.query_params.get('date')
        service_ids_str = request.query_params.get('service_ids')
        stylist_id = request.query_params.get('stylist_id')

        if not date_str or not service_ids_str:
            return Response({"error": "Date and service_ids are required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            appointment_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            service_ids = [int(sid) for sid in service_ids_str.split(',')]
        except (ValueError, TypeError):
            return Response({"error": "Invalid date or service_id format"}, status=status.HTTP_400_BAD_REQUEST)
        
        services = Service.objects.filter(id__in=service_ids)
        if len(services) != len(service_ids):
            return Response({"error": "One or more services not found"}, status=status.HTTP_404_NOT_FOUND)
            
        total_duration = sum(s.duration_minutes for s in services)
        required_categories = {s.category for s in services}

        if stylist_id:
            try:
                stylist = Stylist.objects.get(id=stylist_id)
                stylists = [stylist]
            except Stylist.DoesNotExist:
                return Response({"error": "Stylist not found."}, status=status.HTTP_404_NOT_FOUND)
        else:
            stylists = Stylist.objects.filter(is_available=True)
            for category in required_categories:
                stylists = stylists.filter(specialties=category)
            stylists = stylists.distinct()
        
        available_slots = {}
        for stylist in stylists:
            stylist_slots = self._get_stylist_availability(stylist, appointment_date, total_duration)
            if stylist_slots:
                available_slots[stylist.id] = {
                    "stylist_name": stylist.user.get_full_name(),
                    "slots": stylist_slots
                }
        
        return Response(available_slots)

    def _get_stylist_availability(self, stylist, appointment_date, duration):
        slots = []
        start_hour = 8
        end_hour = 20 # 8 PM
        
        if stylist.working_hours_start:
            start_hour = stylist.working_hours_start.hour
        if stylist.working_hours_end:
            end_hour = stylist.working_hours_end.hour

        existing_appointments = Appointment.objects.filter(
            stylist=stylist,
            appointment_date=appointment_date,
            status__in=['pending', 'approved', 'rescheduled']
        ).order_by('appointment_time')

        current_time = datetime.now(pytz.utc).astimezone(pytz.timezone(settings.TIME_ZONE))
        
        slot_start = datetime.combine(appointment_date, time(start_hour, 0))

        while slot_start.hour < end_hour:
            slot_end = slot_start + timedelta(minutes=duration)
            
            is_valid_slot = True
            
            if appointment_date == current_time.date() and slot_start.time() <= current_time.time():
                is_valid_slot = False
            
            if is_valid_slot:
                for app in existing_appointments:
                    app_start = datetime.combine(appointment_date, app.appointment_time)
                    app_end = app_start + timedelta(minutes=app.duration_minutes)
                    
                    if max(slot_start, app_start) < min(slot_end, app_end):
                        is_valid_slot = False
                        break
            
            if is_valid_slot:
                slots.append(slot_start.strftime('%H:%M'))
            
            slot_start += timedelta(minutes=15)
            
        return slots

class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Review.objects.all().order_by('-created_at')
        stylist_id = self.request.query_params.get('stylist_id')
        if stylist_id:
            queryset = queryset.filter(stylist_id=stylist_id)
        return queryset

    def perform_create(self, serializer):
        appointment_id = self.request.data.get('appointment_id')
        try:
            appointment = Appointment.objects.get(id=appointment_id, customer=self.request.user)
            if Review.objects.filter(appointment=appointment).exists():
                raise serializers.ValidationError("A review for this appointment already exists.")
            serializer.save(customer=self.request.user, stylist=appointment.stylist, appointment=appointment)
        except Appointment.DoesNotExist:
            raise serializers.ValidationError("Appointment not found or you are not the owner.")
            
class PromotionViewSet(viewsets.ModelViewSet):
    queryset = Promotion.objects.filter(is_active=True).order_by('id')
    serializer_class = PromotionSerializer
    permission_classes = [IsAdminOrReadOnly]

class LoyaltyPointViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = LoyaltyPointSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        This viewset should only return the loyalty points for the currently authenticated user.
        """
        user = self.request.user
        return LoyaltyPoint.objects.filter(customer=user)

    @action(detail=False, methods=['post'], url_path='redeem')
    @swagger_auto_schema(request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={'amount': openapi.Schema(type=openapi.TYPE_INTEGER, description='Points to redeem')}
    ))
    def redeem_points(self, request):
        amount = request.data.get('amount')
        if not isinstance(amount, int) or amount <= 0:
            return Response({"error": "Invalid amount specified."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            loyalty_points = LoyaltyPoint.objects.get(customer=request.user)
        except LoyaltyPoint.DoesNotExist:
            return Response({"error": "No loyalty points found for this user."}, status=status.HTTP_404_NOT_FOUND)
        
        if loyalty_points.points < amount:
            return Response({"error": "Insufficient points."}, status=status.HTTP_400_BAD_REQUEST)
            
        with transaction.atomic():
            loyalty_points.points -= amount
            loyalty_points.save()
            
            # Here you might want to create a discount code or apply credit
            # For simplicity, we just reduce points and return a success message
            
        return Response({
            "message": f"{amount} points successfully redeemed.",
            "new_loyalty_points": loyalty_points.points
        })


class FavoriteStylistViewSet(viewsets.ModelViewSet):
    serializer_class = FavoriteStylistSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return FavoriteStylist.objects.filter(customer=self.request.user).order_by('-added_at')

    def perform_create(self, serializer):
        serializer.save(customer=self.request.user)

    def destroy(self, request, *args, **kwargs):
        stylist_id = self.kwargs.get('pk')
        try:
            favorite = FavoriteStylist.objects.get(customer=request.user, stylist_id=stylist_id)
            favorite.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except FavoriteStylist.DoesNotExist:
            return Response({"error": "Favorite not found."}, status=status.HTTP_404_NOT_FOUND)

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.annotate(service_count=Count('services')).order_by('-service_count')
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    
class PasswordResetView(APIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = PasswordResetSerializer

    @swagger_auto_schema(
        operation_description="Request a password reset email.",
        request_body=PasswordResetSerializer,
        responses={200: "Password reset email sent."}
    )
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        User = get_user_model()
        try:
            user = User.objects.get(email=email)
            # Logic to send email
            # send_mail(...)
            return Response({"message": "Password reset email sent."}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            # Still return a positive response to not reveal user existence
            return Response({"message": "Password reset email sent."}, status=status.HTTP_200_OK)

class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = PasswordResetConfirmSerializer
    
    @swagger_auto_schema(
        operation_description="Confirm a password reset.",
        request_body=PasswordResetConfirmSerializer,
        responses={200: "Password has been reset."}
    )
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        # Here you would typically validate the UID and token
        # For simplicity, we'll just "reset" the password
        return Response({"message": "Password has been reset."}, status=status.HTTP_200_OK)

class UserReferralView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        referrals = Referral.objects.filter(referrer=user).select_related('referred_user')
        
        response_data = {
            "referral_code": user.referral_code,
            "referral_link": request.build_absolute_uri(reverse('register')) + f"?ref={user.referral_code}",
            "referrals_made": ReferralSerializer(referrals, many=True).data,
            "referral_bonus_info": "Earn 100 points for each friend who signs up and books an appointment!"
        }
        return Response(response_data)
