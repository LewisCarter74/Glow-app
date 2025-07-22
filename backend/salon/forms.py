from django import forms
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from .models import User

class CustomUserCreationForm(UserCreationForm):
    # Override the password2 field to remove it for a simpler creation form
    password2 = None
    class Meta(UserCreationForm.Meta):
        model = User
        fields = ('email', 'role', 'password', 'profile_image')

class CustomUserChangeForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ('email', 'role', 'profile_image', 'is_active', 'is_staff')
