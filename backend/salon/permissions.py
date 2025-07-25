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
        # Admin has access to all objects
        if request.user and request.user.is_authenticated and request.user.role == 'admin':
            return True
        
        # Check if the object has a 'customer' and if it matches the request user
        if hasattr(obj, 'customer'):
            return obj.customer == request.user
        
        # Check if the object has a 'user' (like Stylist model) and if it matches
        if hasattr(obj, 'user'):
            return obj.user == request.user
            
        return False

class IsAdminOrStylist(permissions.BasePermission):
    """
    Custom permission to only allow administrators or stylists to access a resource.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role in ['admin', 'stylist']

class IsOwner(permissions.BasePermission):
    """
    Custom permission to only allow the owner of an object to access it.
    """
    def has_object_permission(self, request, view, obj):
        if hasattr(obj, 'customer'):
            return obj.customer == request.user
        if hasattr(obj, 'user'): # Fallback for other user-linked models
            return obj.user == request.user
        return False
