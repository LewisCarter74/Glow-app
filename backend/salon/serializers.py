from rest_framework import serializers
from .models import User, Service, Stylist, Appointment, Review, Promotion, LoyaltyPoint, SalonSetting, PortfolioImage, FavoriteStylist, Category, Referral, InspiredWork
from django.contrib.auth import authenticate
from django.db.models import Avg, Q, Count
from django.db.models.functions import ExtractMinute
from django.db.models import F, ExpressionWrapper, fields
from django.urls import reverse_lazy
from django.utils import timezone
from datetime import timedelta, datetime, time
import pytz

class InspiredWorkSerializer(serializers.ModelSerializer):
    imageUrl = serializers.SerializerMethodField()

    class Meta:
        model = InspiredWork
        fields = ('id', 'title', 'description', 'image', 'imageUrl', 'created_at')
        read_only_fields = ('imageUrl', 'created_at')
        extra_kwargs = {'image': {'write_only': True}}

    def get_imageUrl(self, obj):
        if obj.image and hasattr(obj.image, 'url'):
            return obj.image.url
        return None

class UserSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    profile_image_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'phone_number', 'role', 'is_staff', 'is_superuser', 'date_joined', 'name', 'profile_image_url', 'referral_code')
        read_only_fields = ('is_staff', 'is_superuser', 'date_joined', 'role', 'referral_code')

    def get_name(self, obj):
        return obj.get_full_name() or obj.email

    def get_profile_image_url(self, obj):
        if obj.profile_image and hasattr(obj.profile_image, 'url'):
            return obj.profile_image.url
        return None

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    name = serializers.CharField(write_only=True, required=False)
    profile_image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = User
        fields = ('id', 'email', 'password', 'first_name', 'last_name', 'phone_number', 'role', 'name', 'profile_image')
        extra_kwargs = {'password': {'write_only': True}, 'role': {'read_only': True}}

    def create(self, validated_data):
        name = validated_data.pop('name', '')
        profile_image = validated_data.pop('profile_image', None)

        if not validated_data.get('first_name') and name:
            validated_data['first_name'] = name.split(' ')[0]
            if len(name.split(' ')) > 1:
                validated_data['last_name'] = " ".join(name.split(' ')[1:])

        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            phone_number=validated_data.get('phone_number', ''),
            role='customer',
            profile_image=profile_image
        )
        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')

        if email and password:
            user = authenticate(request=self.context.get('request'), email=email, password=password)
            if not user:
                raise serializers.ValidationError("Invalid login credentials.")
        else:
            raise serializers.ValidationError("Must include 'email' and 'password'.")
        data['user'] = user
        return data

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'name')

class ServiceSerializer(serializers.ModelSerializer):
    imageUrl = serializers.SerializerMethodField()
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Service
        fields = ('id', 'name', 'description', 'price', 'duration_minutes', 'category', 'category_name', 'image', 'imageUrl', 'is_active')
        read_only_fields = ('imageUrl', 'category_name')
        extra_kwargs = {'category': {'write_only': True}}

    def get_imageUrl(self, obj):
        if obj.image and hasattr(obj.image, 'url'):
            return obj.image.url
        return None

class PortfolioImageSerializer(serializers.ModelSerializer):
    imageUrl = serializers.SerializerMethodField()

    class Meta:
        model = PortfolioImage
        fields = ('id', 'image', 'imageUrl', 'description', 'uploaded_at')
        read_only_fields = ('uploaded_at', 'imageUrl')
        extra_kwargs = {'image': {'write_only': True}}

    def get_imageUrl(self, obj):
        if obj.image and hasattr(obj.image, 'url'):
            return obj.image.url
        return None

class StylistSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(queryset=User.objects.filter(role='stylist'), write_only=True, source='user', required=False)
    rating = serializers.SerializerMethodField()
    reviewCount = serializers.SerializerMethodField()
    portfolio = serializers.SerializerMethodField()
    imageUrl = serializers.SerializerMethodField()
    specialties = serializers.SlugRelatedField(
        many=True,
        queryset=Category.objects.all(),
        slug_field='name',
        required=False,
        allow_empty=True
    )

    class Meta:
        model = Stylist
        fields = (
            'id', 'user', 'user_id', 'bio', 'specialties', 'working_hours_start',
            'working_hours_end', 'is_available', 'is_featured', 'image', 
            'rating', 'reviewCount', 'portfolio', 'imageUrl'
        )
        read_only_fields = ('user', 'rating', 'reviewCount', 'portfolio', 'imageUrl')
        extra_kwargs = {'image': {'write_only': True}}

    def get_rating(self, obj):
        return obj.review_set.aggregate(avg_rating=Avg('rating'))['avg_rating'] or 0.0

    def get_reviewCount(self, obj):
        return obj.review_set.count()

    def get_portfolio(self, obj):
        return [img.image.url for img in obj.portfolio_images.all() if img.image]

    def get_imageUrl(self, obj):
        if obj.image and hasattr(obj.image, 'url'):
            return obj.image.url
        first_portfolio_image = obj.portfolio_images.first()
        if first_portfolio_image and first_portfolio_image.image:
            return first_portfolio_image.image.url
        return "https://placehold.co/1200x800"

class AppointmentSerializer(serializers.ModelSerializer):
    customer = UserSerializer(read_only=True)
    stylist = StylistSerializer(read_only=True)
    services = ServiceSerializer(many=True, read_only=True)
    stylist_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    service_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True
    )
    can_review = serializers.SerializerMethodField()

    class Meta:
        model = Appointment
        fields = ('id', 'customer', 'stylist', 'stylist_id', 'services', 'service_ids', 'appointment_date', 'appointment_time', 'duration_minutes', 'status', 'created_at', 'updated_at', 'can_review')
        read_only_fields = ('customer', 'created_at', 'updated_at', 'status', 'stylist', 'duration_minutes')

    def validate(self, data):
        stylist_id = data.get('stylist_id')
        service_ids = data.get('service_ids')
        appointment_date = data.get('appointment_date')
        appointment_time = data.get('appointment_time')

        if not service_ids:
            raise serializers.ValidationError({"service_ids": "At least one service must be selected."})
        
        services = Service.objects.filter(id__in=service_ids)
        if len(services) != len(service_ids):
            raise serializers.ValidationError({"service_ids": "One or more services not found."})

        data['services'] = services
        total_duration = sum(s.duration_minutes for s in services)
        data['duration_minutes'] = total_duration

        required_categories = set(service.category for service in services)

        if stylist_id is not None:
            try:
                stylist = Stylist.objects.get(id=stylist_id)
            except Stylist.DoesNotExist:
                raise serializers.ValidationError({"stylist_id": "Preferred stylist not found."})

            if not stylist.is_available:
                raise serializers.ValidationError({"stylist_id": "Preferred stylist is not available."})

            stylist_specialties = set(stylist.specialties.all())
            
            if not required_categories.issubset(stylist_specialties):
                missing_categories = required_categories - stylist_specialties
                missing_category_names = [cat.name for cat in missing_categories]
                raise serializers.ValidationError({"stylist_id": f"Preferred stylist does not specialize in category(ies): {', '.join(missing_category_names)}."})

            start_datetime = datetime.combine(appointment_date, appointment_time)
            end_datetime = start_datetime + timedelta(minutes=total_duration)

            conflicting_appointments = Appointment.objects.filter(
                stylist=stylist,
                appointment_date=appointment_date,
                status__in=['pending', 'approved', 'rescheduled']
            ).annotate(
                existing_appointment_end_time=ExpressionWrapper(
                    F('appointment_time') + timedelta(minutes=1) * F('duration_minutes'),
                    output_field=fields.TimeField()
                )
            ).filter(
                Q(appointment_time__lt=end_datetime.time()) &
                Q(existing_appointment_end_time__gt=appointment_time)
            )

            if self.instance:
                conflicting_appointments = conflicting_appointments.exclude(pk=self.instance.pk)

            if conflicting_appointments.exists():
                raise serializers.ValidationError({"detail": "This time slot conflicts with an existing appointment for the preferred stylist."})

            data['stylist'] = stylist
        else:
            required_category_ids = [cat.id for cat in required_categories]
            available_stylists = Stylist.objects.filter(
                is_available=True,
                specialties__id__in=required_category_ids
            ).annotate(
                num_matching_specialties=Count('specialties', filter=Q(specialties__id__in=required_category_ids))
            ).filter(
                num_matching_specialties=len(required_category_ids)
            ).distinct()

            if not available_stylists.exists():
                raise serializers.ValidationError({"detail": "No stylist available for the selected services' categories."})

            potential_stylists = []
            for s in available_stylists:
                if s.working_hours_start and appointment_time < s.working_hours_start:
                    continue
                if s.working_hours_end and appointment_time > s.working_hours_end:
                    continue

                start_datetime = datetime.combine(appointment_date, appointment_time)
                end_datetime = start_datetime + timedelta(minutes=total_duration)

                conflicting_appointments = Appointment.objects.filter(
                    stylist=s,
                    appointment_date=appointment_date,
                    status__in=['pending', 'approved', 'rescheduled']
                ).annotate(
                    existing_appointment_end_time=ExpressionWrapper(
                        F('appointment_time') + timedelta(minutes=1) * F('duration_minutes'),
                        output_field=fields.TimeField()
                    )
                ).filter(
                    Q(appointment_time__lt=end_datetime.time()) &
                    Q(existing_appointment_end_time__gt=appointment_time)
                )
                
                if not conflicting_appointments.exists():
                    potential_stylists.append(s)

            if not potential_stylists:
                raise serializers.ValidationError({"detail": "No stylist available at the requested time for the selected services."})

            assigned_stylist = potential_stylists[0]
            data['stylist'] = assigned_stylist

        now = timezone.now()
        appointment_datetime = datetime.combine(appointment_date, appointment_time)
        
        if timezone.is_naive(appointment_datetime):
            appointment_datetime = timezone.make_aware(appointment_datetime, pytz.utc)

        if appointment_datetime < now:
            raise serializers.ValidationError({"appointment_date": "Appointment must be in the future."})

        return data

    def get_can_review(self, obj):
        return obj.status == 'completed' and not hasattr(obj, 'review')

    def create(self, validated_data):
        services = validated_data.pop('services')
        validated_data.pop('service_ids', None)
        appointment = Appointment.objects.create(**validated_data)
        appointment.services.set(services)
        return appointment

class ReviewSerializer(serializers.ModelSerializer):
    customer_name = serializers.SerializerMethodField()
    stylist_name = serializers.SerializerMethodField()
    appointment_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Review
        fields = ('id', 'appointment_id', 'rating', 'comment', 'created_at', 'customer_name', 'stylist_name')
        read_only_fields = ('created_at', 'customer_name', 'stylist_name')

    def get_customer_name(self, obj):
        return obj.customer.get_full_name() or obj.customer.email.split('@')[0]

    def get_stylist_name(self, obj):
        return obj.stylist.user.get_full_name() or obj.stylist.user.email.split('@')[0]

    def validate(self, data):
        appointment_id = data.get('appointment_id')
        customer = self.context['request'].user

        try:
            appointment = Appointment.objects.get(id=appointment_id)
        except Appointment.DoesNotExist:
            raise serializers.ValidationError({"appointment_id": "Appointment not found."})

        if appointment.customer != customer:
            raise serializers.ValidationError({"detail": "You can only review your own appointments."})

        if appointment.status != 'completed':
            raise serializers.ValidationError({"detail": "Reviews can only be left for completed appointments."})

        if hasattr(appointment, 'review'):
            raise serializers.ValidationError({"detail": "You have already reviewed this appointment."})

        data['appointment'] = appointment
        data['customer'] = customer
        data['stylist'] = appointment.stylist
        return data

class PromotionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Promotion
        fields = '__all__'

class LoyaltyPointSerializer(serializers.ModelSerializer):
    customer = UserSerializer(read_only=True)
    class Meta:
        model = LoyaltyPoint
        fields = '__all__'
        read_only_fields = ('customer',)

class FavoriteStylistSerializer(serializers.ModelSerializer):
    customer = UserSerializer(read_only=True)
    stylist = StylistSerializer(read_only=True)
    stylist_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = FavoriteStylist
        fields = ('id', 'customer', 'stylist', 'stylist_id', 'added_at')
        read_only_fields = ('customer', 'added_at')
        extra_kwargs = {'stylist': {'read_only': True}}

    def validate(self, data):
        stylist_id = data.get('stylist_id')
        customer = self.context['request'].user

        try:
            stylist = Stylist.objects.get(id=stylist_id)
        except Stylist.DoesNotExist:
            raise serializers.ValidationError({"stylist_id": "Stylist not found."})

        if self.context['request'].method == 'POST':
            if FavoriteStylist.objects.filter(customer=customer, stylist=stylist).exists():
                raise serializers.ValidationError({"detail": "Stylist already in favorites."})

        data['stylist'] = stylist
        data['customer'] = customer
        return data

class SalonSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalonSetting
        fields = '__all__'

class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)

class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField(required=True)
    token = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, write_only=True, min_length=8)

    def validate(self, data):
        return data

class AIStyleRecommendationInputSerializer(serializers.Serializer):
    preferences = serializers.CharField(required=False, allow_blank=True, max_length=1000)
    image = serializers.ImageField(required=False, allow_null=True)

    def validate(self, data):
        if not data.get('preferences') and not data.get('image'):
            raise serializers.ValidationError("Either preferences or an image must be provided.")
        return data

class AIStyleRecommendationOutputSerializer(serializers.Serializer):
    description = serializers.CharField()
    imageUrl = serializers.URLField()
    specialistId = serializers.IntegerField(required=False, allow_null=True)

class AIRecommendationResponseSerializer(serializers.Serializer):
    recommendations = AIStyleRecommendationOutputSerializer(many=True)

class ReferralSerializer(serializers.ModelSerializer):
    referred_user = UserSerializer(read_only=True)

    class Meta:
        model = Referral
        fields = ('id', 'referrer', 'referred_user', 'created_at')
        read_only_fields = ('id', 'referrer', 'referred_user', 'created_at')
