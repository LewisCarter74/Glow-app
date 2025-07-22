from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Service, Stylist, Appointment, Review, Promotion, LoyaltyPoint, SalonSetting
from .forms import CustomUserCreationForm, CustomUserChangeForm # Import the custom forms

# Register your models here.

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    add_form = CustomUserCreationForm # Use custom form for adding users
    form = CustomUserChangeForm # Use custom form for changing users
    model = User # Explicitly set model

    list_display = ('id', 'email', 'first_name', 'last_name', 'role', 'is_staff', 'is_active')
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('email',)
    filter_horizontal = ()
    list_filter = ('role', 'is_staff', 'is_active')
    
    # The fieldsets define which fields are shown in the admin forms
    # They should align with the fields in CustomUserChangeForm and CustomUserCreationForm
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'phone_number', 'role', 'profile_image')}),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    # add_fieldsets is for the user creation form specifically
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password', 'password2'),
        }),
        ('Personal info', {'fields': ('first_name', 'last_name', 'phone_number', 'role', 'profile_image')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
    )


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'duration_minutes', 'category', 'is_active')
    list_filter = ('is_active', 'category')
    search_fields = ('name',)

@admin.register(Stylist)
class StylistAdmin(admin.ModelAdmin):
    list_display = ('user', 'is_available', 'is_featured', 'working_hours_start', 'working_hours_end')
    list_filter = ('is_available', 'is_featured', 'specialties')
    search_fields = ('user__email', 'user__first_name', 'user__last_name')
    raw_id_fields = ('user',)

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('customer', 'stylist', 'display_services', 'appointment_date', 'appointment_time', 'status')
    list_filter = ('status', 'appointment_date', 'stylist', 'services')
    search_fields = ('customer__email', 'stylist__user__email', 'services__name')
    raw_id_fields = ('customer', 'stylist')
    filter_horizontal = ('services',)
    date_hierarchy = 'appointment_date'

    def display_services(self, obj):
        return ", ".join([service.name for service in obj.services.all()])
    display_services.short_description = 'Services'

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('appointment', 'customer', 'stylist', 'rating', 'created_at')
    list_filter = ('rating', 'created_at', 'stylist')
    search_fields = ('customer__email', 'stylist__user__email', 'comment')
    raw_id_fields = ('appointment', 'customer', 'stylist')

@admin.register(Promotion)
class PromotionAdmin(admin.ModelAdmin):
    list_display = ('name', 'promo_type', 'discount_value', 'is_active', 'valid_from', 'valid_until')
    list_filter = ('promo_type', 'is_active', 'valid_from', 'valid_until')
    search_fields = ('name', 'description')

@admin.register(LoyaltyPoint)
class LoyaltyPointAdmin(admin.ModelAdmin):
    list_display = ('customer', 'points', 'last_updated')
    search_fields = ('customer__email',)
    raw_id_fields = ('customer',)

@admin.register(SalonSetting)
class SalonSettingAdmin(admin.ModelAdmin):
    list_display = ('key', 'value', 'description')
    search_fields = ('key',)
