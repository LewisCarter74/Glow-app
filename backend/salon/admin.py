from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Service, Stylist, Appointment, Review, Promotion, LoyaltyPoint, SalonSetting

# Register your models here.

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('id', 'email', 'first_name', 'last_name', 'role', 'is_staff', 'is_active') # Added 'id' here
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('email',)
    filter_horizontal = ()
    list_filter = ('role', 'is_staff', 'is_active')
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'phone_number', 'role')}),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'duration_minutes', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('name',)

@admin.register(Stylist)
class StylistAdmin(admin.ModelAdmin):
    list_display = ('user', 'is_available', 'working_hours_start', 'working_hours_end')
    list_filter = ('is_available', 'specialties')
    search_fields = ('user__email', 'user__first_name', 'user__last_name')
    raw_id_fields = ('user',)

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('customer', 'stylist', 'service', 'appointment_date', 'appointment_time', 'status')
    list_filter = ('status', 'appointment_date', 'stylist', 'service')
    search_fields = ('customer__email', 'stylist__user__email', 'service__name')
    raw_id_fields = ('customer', 'stylist', 'service')
    date_hierarchy = 'appointment_date'

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
