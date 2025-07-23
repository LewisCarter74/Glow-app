from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator

# Custom User Manager
class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('role', 'admin')

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        return self.create_user(email, password, **extra_fields)

# Custom User Model
class User(AbstractUser):
    ROLE_CHOICES = (
        ('customer', 'Customer'),
        ('stylist', 'Stylist'),
        ('admin', 'Admin'),
    )
    id = models.BigAutoField(primary_key=True) 
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='customer')
    profile_image = models.ImageField(upload_to='profile_images/', blank=True, null=True)
    username = None 

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    def __str__(self):
        return self.email

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'

# New Category Model
class Category(models.Model):
    name = models.CharField(max_length=50, unique=True)

    class Meta:
        verbose_name_plural = 'Categories'

    def __str__(self):
        return self.name

class Service(models.Model):
    id = models.BigAutoField(primary_key=True) 
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    duration_minutes = models.IntegerField(default=30, validators=[MinValueValidator(1)])
    # Temporarily add old_category_name for data migration
    old_category_name = models.CharField(max_length=255, null=True, blank=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='services') # Ensure null=True, blank=True
    image = models.ImageField(upload_to='service_images/', blank=True, null=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

class Stylist(models.Model):
    id = models.BigAutoField(primary_key=True) 
    user = models.OneToOneField('User', on_delete=models.CASCADE, limit_choices_to={'role': 'stylist'})
    bio = models.TextField(blank=True, null=True)
    # Changed from ManyToManyField(Service) to ManyToManyField(Category)
    specialties = models.ManyToManyField(Category, blank=True, related_name='stylists')
    working_hours_start = models.TimeField(blank=True, null=True)
    working_hours_end = models.TimeField(blank=True, null=True)
    is_available = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False) 
    image = models.ImageField(upload_to='stylist_images/', blank=True, null=True)

    def __str__(self):
        return self.user.get_full_name() or self.user.email

class PortfolioImage(models.Model): 
    id = models.BigAutoField(primary_key=True)
    stylist = models.ForeignKey(Stylist, on_delete=models.CASCADE, related_name='portfolio_images')
    image = models.ImageField(upload_to='portfolio_images/')
    description = models.CharField(max_length=255, blank=True, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Portfolio for {self.stylist.user.first_name} - {self.id}'

class Appointment(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('rescheduled', 'Rescheduled'),
    )

    id = models.BigAutoField(primary_key=True) 
    customer = models.ForeignKey('User', on_delete=models.CASCADE, related_name='appointments_as_customer', limit_choices_to={'role': 'customer'})
    stylist = models.ForeignKey(Stylist, on_delete=models.SET_NULL, null=True, related_name='appointments_as_stylist')
    services = models.ManyToManyField(Service)
    appointment_date = models.DateField()
    appointment_time = models.TimeField()
    duration_minutes = models.IntegerField(default=30)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['appointment_date', 'appointment_time']

    def __str__(self):
        return f'{self.customer.email} with {self.stylist.user.get_full_name() or self.stylist.user.email} on {self.appointment_date} at {self.appointment_time}'

class Review(models.Model):
    id = models.BigAutoField(primary_key=True) 
    appointment = models.OneToOneField(Appointment, on_delete=models.CASCADE, related_name='review')
    customer = models.ForeignKey('User', on_delete=models.CASCADE, limit_choices_to={'role': 'customer'})
    stylist = models.ForeignKey(Stylist, on_delete=models.CASCADE)
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('appointment', 'customer')
        ordering = ['-created_at'] 

    def __str__(self):
        return f'Review for {self.stylist.user.get_full_name() or self.stylist.user.email} by {self.customer.email}'

class Promotion(models.Model):
    PROMOTION_TYPE_CHOICES = (
        ('first_time', 'First Time Customer Discount'),
        ('loyalty_redemption', 'Loyalty Points Redemption'),
        ('percentage', 'Percentage Discount'),
        ('fixed_amount', 'Fixed Amount Discount'),
    )
    id = models.BigAutoField(primary_key=True) 
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True, null=True)
    promo_type = models.CharField(max_length=50, choices=PROMOTION_TYPE_CHOICES)
    discount_value = models.DecimalField(max_digits=5, decimal_places=2, help_text="Percentage (e.g., 15 for 15%) or Fixed Amount")
    is_active = models.BooleanField(default=True)
    valid_from = models.DateTimeField(default=timezone.now)
    valid_until = models.DateTimeField(blank=True, null=True)
    minimum_booking_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    def __str__(self):
        return self.name

class LoyaltyPoint(models.Model):
    id = models.BigAutoField(primary_key=True) 
    customer = models.OneToOneField('User', on_delete=models.CASCADE, limit_choices_to={'role': 'customer'})
    points = models.IntegerField(default=0)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'{self.customer.email}: {self.points} points'

class FavoriteStylist(models.Model): 
    id = models.BigAutoField(primary_key=True) 
    customer = models.ForeignKey('User', on_delete=models.CASCADE, limit_choices_to={'role': 'customer'}, related_name='favorite_stylists_customer')
    stylist = models.ForeignKey(Stylist, on_delete=models.CASCADE, related_name='favorited_by_customers')
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('customer', 'stylist')
        ordering = ['-added_at']

    def __str__(self):
        return f'{self.customer.email} favorited {self.stylist.user.first_name}'

class SalonSetting(models.Model):
    id = models.BigAutoField(primary_key=True) 
    key = models.CharField(max_length=255, unique=True, help_text="e.g., 'loyalty_points_per_booking', 'cancellation_policy'")
    value = models.TextField()
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.key
