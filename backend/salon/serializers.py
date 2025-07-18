from rest_framework import serializers
from .models import User, Service, Stylist, Appointment, Review, Promotion, LoyaltyPoint, SalonSetting, PortfolioImage, FavoriteStylist
from django.contrib.auth import authenticate
from django.db.models import Avg
from django.urls import reverse_lazy

class UserSerializer(serializers.ModelSerializer):
    # Add a 'name' field for frontend compatibility
    name = serializers.SerializerMethodField()
    profile_image_url = serializers.SerializerMethodField() # To provide URL for frontend

    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'phone_number', 'role', 'is_staff', 'is_superuser', 'date_joined', 'name', 'profile_image_url')
        read_only_fields = ('is_staff', 'is_superuser', 'date_joined', 'role') # role should be read-only after creation

    def get_name(self, obj):
        return obj.get_full_name() or obj.email # Return full name or email if name not set

    def get_profile_image_url(self, obj):
        if obj.profile_image and hasattr(obj.profile_image, 'url'):
            return obj.profile_image.url
        return None

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    name = serializers.CharField(write_only=True, required=False) # For frontend compatibility
    profile_image = serializers.ImageField(required=False, allow_null=True) # For file upload

    class Meta:
        model = User
        fields = ('id', 'email', 'password', 'first_name', 'last_name', 'phone_number', 'role', 'name', 'profile_image')
        extra_kwargs = {'password': {'write_only': True}, 'role': {'read_only': True}}

    def create(self, validated_data):
        name = validated_data.pop('name', '') # Remove 'name' if present
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
            role='customer', # Force role to customer on registration
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

class ServiceSerializer(serializers.ModelSerializer):
    imageUrl = serializers.SerializerMethodField() # To provide URL for frontend

    class Meta:
        model = Service
        fields = ('id', 'name', 'description', 'price', 'duration_minutes', 'category', 'image', 'imageUrl', 'is_active') # Added 'image' field
        read_only_fields = ('imageUrl',)

    def get_imageUrl(self, obj):
        if obj.image and hasattr(obj.image, 'url'):
            return obj.image.url
        return None # Return None or a default placeholder if no image

class PortfolioImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PortfolioImage
        fields = ('id', 'image_url', 'description', 'uploaded_at')
        read_only_fields = ('uploaded_at',)

class StylistSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(queryset=User.objects.filter(role='stylist'), write_only=True, source='user', required=False)
    
    # Fields for frontend data requirements
    rating = serializers.SerializerMethodField()
    reviewCount = serializers.SerializerMethodField()
    portfolio = serializers.SerializerMethodField() # Frontend expects a list of URLs
    imageUrl = serializers.SerializerMethodField() # Frontend expects a single image URL
    specialties = serializers.SerializerMethodField() # Return only names of specialties

    class Meta:
        model = Stylist
        fields = (
            'id', 'user', 'user_id', 'bio', 'specialties', 'working_hours_start',
            'working_hours_end', 'is_available', 'is_featured', 'image', # Added 'image' field
            'rating', 'reviewCount', 'portfolio', 'imageUrl'
        )
        read_only_fields = ('rating', 'reviewCount', 'portfolio', 'imageUrl', 'specialties')

    def get_rating(self, obj):
        return obj.review_set.aggregate(avg_rating=Avg('rating'))['avg_rating'] or 0.0

    def get_reviewCount(self, obj):
        return obj.review_set.count()

    def get_portfolio(self, obj):
        # Returns a list of image URLs from PortfolioImage related to this stylist
        return [img.image_url for img in obj.portfolio_images.all()]

    def get_imageUrl(self, obj):
        # Returns the stylist's main image or a default if none exists
        if obj.image and hasattr(obj.image, 'url'):
            return obj.image.url
        first_portfolio_image = obj.portfolio_images.first()
        return first_portfolio_image.image_url if first_portfolio_image else "https://placehold.co/1200x800" # Placeholder

    def get_specialties(self, obj):
        # Return a list of specialty names (strings)
        return [service.name for service in obj.specialties.all()]


class AppointmentSerializer(serializers.ModelSerializer):
    customer = UserSerializer(read_only=True)
    stylist = StylistSerializer(read_only=True)
    service = ServiceSerializer(read_only=True)

    stylist_id = serializers.UUIDField(write_only=True) # Change to UUIDField
    service_id = serializers.UUIDField(write_only=True) # Change to UUIDField
    
    can_review = serializers.SerializerMethodField() # New field for frontend

    class Meta:
        model = Appointment
        fields = ('id', 'customer', 'stylist', 'stylist_id', 'service', 'service_id', 'appointment_date', 'appointment_time', 'duration_minutes', 'status', 'created_at', 'updated_at', 'can_review')
        read_only_fields = ('customer', 'created_at', 'updated_at', 'status') # status is managed by backend actions

    def validate(self, data):
        stylist_id = data.get('stylist_id')
        service_id = data.get('service_id')
        appointment_date = data.get('appointment_date')
        appointment_time = data.get('appointment_time')
        
        # Resolve UUIDs to model instances
        try:
            stylist = Stylist.objects.get(id=stylist_id)
        except Stylist.DoesNotExist:
            raise serializers.ValidationError({"stylist_id": "Stylist not found."})
        
        try:
            service = Service.objects.get(id=service_id)
        except Service.DoesNotExist:
            raise serializers.ValidationError({"service_id": "Service not found."})

        data['stylist'] = stylist
        data['service'] = service

        # Check if the stylist offers the selected service
        if service not in stylist.specialties.all():
            raise serializers.ValidationError({"service_id": "Selected stylist does not offer this service."})

        # Check if the stylist is available at the requested time
        # This is a basic check, more complex logic (like working hours) should be added here
        if stylist.working_hours_start and appointment_time < stylist.working_hours_start:
            raise serializers.ValidationError({"appointment_time": "Appointment time is before stylist's working hours."})
        if stylist.working_hours_end and appointment_time > stylist.working_hours_end:
            raise serializers.ValidationError({"appointment_time": "Appointment time is after stylist's working hours."})

        # Check for existing appointments (prevent double booking for the stylist)
        existing_appointments = Appointment.objects.filter(
            stylist=stylist,
            appointment_date=appointment_date,
            appointment_time=appointment_time,
            status__in=['pending', 'approved', 'rescheduled']
        )
        
        if self.instance: # Exclude current instance if updating
            existing_appointments = existing_appointments.exclude(pk=self.instance.pk)
            
        if existing_appointments.exists():
            raise serializers.ValidationError({"detail": "This time slot is not available for the selected stylist."})
            
        return data

    def get_can_review(self, obj):
        # A review can be left if the appointment is 'completed' and no review already exists for it.
        return obj.status == 'completed' and not hasattr(obj, 'review')

    def create(self, validated_data):
        # The `customer` is passed from the view's `perform_create`
        # The `duration_minutes` is set based on the `service` in the view
        return Appointment.objects.create(**validated_data)

class ReviewSerializer(serializers.ModelSerializer):
    customer_name = serializers.SerializerMethodField()
    stylist_name = serializers.SerializerMethodField()
    # appointment = AppointmentSerializer(read_only=True) # Keep for full representation if needed

    appointment_id = serializers.UUIDField(write_only=True)
    # customer_id and stylist_id are not needed for write operations if taken from authenticated user and appointment

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
        customer = self.context['request'].user # Get customer from request

        try:
            appointment = Appointment.objects.get(id=appointment_id)
        except Appointment.DoesNotExist:
            raise serializers.ValidationError({"appointment_id": "Appointment not found."})

        if appointment.customer != customer:
            raise serializers.ValidationError({"detail": "You can only review your own appointments."})

        if appointment.status != 'completed':
            raise serializers.ValidationError({"detail": "Reviews can only be left for completed appointments."})

        if hasattr(appointment, 'review'): # Check if a review already exists for this appointment
            raise serializers.ValidationError({"detail": "You have already reviewed this appointment."})

        data['appointment'] = appointment
        data['customer'] = customer
        data['stylist'] = appointment.stylist # Automatically associate stylist from appointment
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
    stylist = StylistSerializer(read_only=True) # Return full stylist data for convenience
    stylist_id = serializers.UUIDField(write_only=True) # For adding/removing by ID

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

        # Check if already favorited (for create)
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
        # This is where Django's password reset token validation would happen.
        # For now, just basic validation to ensure fields are present.
        return data

# AI Feature Serializers
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
    specialistId = serializers.UUIDField(required=False, allow_null=True) # Link to a Stylist ID

class AIRecommendationResponseSerializer(serializers.Serializer):
    recommendations = AIStyleRecommendationOutputSerializer(many=True)
