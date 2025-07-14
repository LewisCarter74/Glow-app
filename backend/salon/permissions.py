from rest_framework import permissions

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow administrators to edit objects.
    Read-only access is allowed for unauthenticated users.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated and request.user.role == 'admin'

class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object or an admin to edit it.
    """
    def has_object_permission(self, request, view, obj):
        if request.user and request.user.is_authenticated and request.user.role == 'admin':
            return True
        # For Appointment, Review, LoyaltyPoint, check if the request.user is the customer
        if hasattr(obj, 'customer') and obj.customer == request.user:
            return True
        # For Stylist, check if the request.user is the stylist's associated user
        if hasattr(obj, 'user') and obj.user == request.user and request.user.role == 'stylist':
            return True
        return False

class IsStylistOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow stylists or administrators to edit/view.
    """
    def has_permission(self, request, view):
        if request.user and request.user.is_authenticated:
            return request.user.role in ['stylist', 'admin']
        return False

    def has_object_permission(self, request, view, obj):
        if request.user and request.user.is_authenticated and request.user.role == 'admin':
            return True
        if request.user and request.user.is_authenticated and request.user.role == 'stylist':
            if isinstance(obj, Stylist):
                return obj.user == request.user
            if isinstance(obj, Appointment):
                return obj.stylist.user == request.user
        return False

class IsCustomerOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow customers or administrators to edit/view.
    """
    def has_permission(self, request, view):
        if request.user and request.user.is_authenticated:
            return request.user.role in ['customer', 'admin']
        return False

    def has_object_permission(self, request, view, obj):
        if request.user and request.user.is_authenticated and request.user.role == 'admin':
            return True
        if request.user and request.user.is_authenticated and request.user.role == 'customer':
            if isinstance(obj, LoyaltyPoint):
                return obj.customer == request.user
            if isinstance(obj, Appointment):
                return obj.customer == request.user
            if isinstance(obj, Review):
                return obj.customer == request.user
        return False
