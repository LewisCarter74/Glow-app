from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RegisterView, LoginView, UserProfileView,
    ServiceViewSet, StylistViewSet, AppointmentViewSet, ReviewViewSet,
    PromotionViewSet, LoyaltyPointViewSet, FavoriteStylistViewSet,
    CategoryViewSet, PasswordResetView, PasswordResetConfirmView,
    UserReferralView, InspiredWorkViewSet
)

router = DefaultRouter()
router.register(r'services', ServiceViewSet)
router.register(r'stylists', StylistViewSet)
router.register(r'appointments', AppointmentViewSet, basename='appointment')
router.register(r'reviews', ReviewViewSet, basename='review')
router.register(r'promotions', PromotionViewSet)
router.register(r'favorites', FavoriteStylistViewSet, basename='favorite')
router.register(r'categories', CategoryViewSet)
router.register(r'inspired-work', InspiredWorkViewSet)
router.register(r'loyalty-points', LoyaltyPointViewSet, basename='loyalty-point')


urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('password-reset/', PasswordResetView.as_view(), name='password-reset'),
    path('password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    path('referrals/', UserReferralView.as_view(), name='user-referrals'),
    path('', include(router.urls)),
]
