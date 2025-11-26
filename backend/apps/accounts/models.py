"""
Custom User model for authentication.
"""
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom User model extending AbstractUser.
    Uses email as the primary identifier instead of username.
    """
    email = models.EmailField(unique=True, verbose_name='Email Address')
    username = models.CharField(max_length=150, unique=True, verbose_name='Username')
    first_name = models.CharField(max_length=150, blank=True, verbose_name='First Name')
    last_name = models.CharField(max_length=150, blank=True, verbose_name='Last Name')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Created At')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Updated At')

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:
        db_table = 'users'
        ordering = ['-created_at']
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        """String representation of the user."""
        return self.email
