from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RegisterView, LoginView, UserProfileView,
    ServiceViewSet, StylistViewSet, AppointmentViewSet, ReviewViewSet,
    PromotionViewSet, LoyaltyPointView, FavoriteStylistViewSet,
    CategoryViewSet, PasswordResetView, PasswordResetConfirmView,
    AIStyleRecommendationView, AIStyleRecommendationResultView, UserReferralView, InspiredWorkViewSet
)

router = DefaultRouter()
router.register(r'services', ServiceViewSet)
router.register(r'stylists', StylistViewSet)
router.register(r'appointments', AppointmentViewSet, basename='appointment')
router.register(r'reviews', ReviewViewSet, basename='review')
router.register(r'promotions', PromotionViewSet)
router.register(r'favorites', FavoriteStylistViewSet, basename='favorite-stylist')
router.register(r'categories', CategoryViewSet)
router.register(r'inspired-work', InspiredWorkViewSet)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('loyalty-points/', LoyaltyPointView.as_view(), name='loyalty-points'),
    path('password-reset/', PasswordResetView.as_view(), name='password-reset'),
    path('password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    path('ai-style-recommendation/', AIStyleRecommendationView.as_view(), name='ai-style-recommendation'),
    path('ai-style-recommendation/result/<str:task_id>/', AIStyleRecommendationResultView.as_view(), name='ai-style-recommendation-result'),
    path('referrals/', UserReferralView.as_view(), name='user-referrals'),
    path('', include(router.urls)),
]
