from django.urls import path
from .views import (
    RegisterView, LoginView, UserProfileView, PasswordResetView, PasswordResetConfirmView,
    ServiceListCreateView, ServiceDetailView,
    StylistListCreateView, StylistDetailView,
    AppointmentListCreateView, AppointmentDetailView,
    ReviewListCreateView, ReviewDetailView,
    PromotionListCreateView, PromotionDetailView,
    LoyaltyPointView, LoyaltyPointRedeemView,
    AnalyticsView,
    SalonSettingListCreateView, SalonSettingDetailView,
)

urlpatterns = [
    # Auth
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('password-reset/', PasswordResetView.as_view(), name='password-reset'),
    path('password-reset-confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),

    # Services
    path('services/', ServiceListCreateView.as_view(), name='service-list-create'),
    path('services/<int:pk>/', ServiceDetailView.as_view(), name='service-detail'),

    # Stylists
    path('stylists/', StylistListCreateView.as_view(), name='stylist-list-create'),
    path('stylists/<int:pk>/', StylistDetailView.as_view(), name='stylist-detail'),

    # Appointments
    path('appointments/', AppointmentListCreateView.as_view(), name='appointment-list-create'),
    path('appointments/<int:pk>/', AppointmentDetailView.as_view(), name='appointment-detail'),

    # Reviews
    path('reviews/', ReviewListCreateView.as_view(), name='review-list-create'),
    path('reviews/<int:pk>/', ReviewDetailView.as_view(), name='review-detail'),

    # Promotions
    path('promotions/', PromotionListCreateView.as_view(), name='promotion-list-create'),
    path('promotions/<int:pk>/', PromotionDetailView.as_view(), name='promotion-detail'),

    # Loyalty Points
    path('loyalty-points/', LoyaltyPointView.as_view(), name='loyalty-point-detail'),
    path('loyalty-points/redeem/', LoyaltyPointRedeemView.as_view(), name='loyalty-point-redeem'), # Re-added

    # Analytics
    path('analytics/', AnalyticsView.as_view(), name='analytics'),

    # Salon Settings
    path('salon-settings/', SalonSettingListCreateView.as_view(), name='salon-setting-list-create'),
    path('salon-settings/<int:pk>/', SalonSettingDetailView.as_view(), name='salon-setting-detail'),
]
