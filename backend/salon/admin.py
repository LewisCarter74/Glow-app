from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Service, Stylist, Appointment, Review, Promotion, LoyaltyPoint, SalonSetting, PortfolioImage, InspiredWork # Import InspiredWork
from .forms import CustomUserCreationForm, CustomUserChangeForm

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    form = CustomUserChangeForm
    add_form = CustomUserCreationForm

    list_display = ('email', 'first_name', 'last_name', 'role', 'is_staff', 'is_active')
    list_filter = ('role', 'is_staff', 'is_active')
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('email',)

    # Fieldsets for the 'change' page (when you edit a user)
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name', 'phone_number', 'profile_image')}),
        ('Permissions', {'fields': ('role', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    # Fieldsets for the 'add' page. Updated to match your desired fields.
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'role', 'password', 'profile_image'),
        }),
    )

    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        if obj.role == 'stylist' and not hasattr(obj, 'stylist'):
            Stylist.objects.create(user=obj)

@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'duration_minutes', 'category', 'is_active')
    list_filter = ('is_active', 'category')
    search_fields = ('name',)

@admin.register(Stylist)
class StylistAdmin(admin.ModelAdmin):
    list_display = ('user', 'is_available', 'is_featured')
    search_fields = ('user__email', 'user__first_name', 'user__last_name')
    raw_id_fields = ('user',)
    filter_horizontal = ('specialties',)

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

@admin.register(PortfolioImage)
class PortfolioImageAdmin(admin.ModelAdmin):
    list_display = ('stylist', 'description', 'uploaded_at')
    raw_id_fields = ('stylist',)

# Register the InspiredWork model
@admin.register(InspiredWork)
class InspiredWorkAdmin(admin.ModelAdmin):
    list_display = ('title', 'created_at')
    search_fields = ('title', 'description')
