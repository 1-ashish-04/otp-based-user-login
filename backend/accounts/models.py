import secrets

from django.db import models


def generate_login_code() -> str:
    """Random 6-digit numeric code, zero-padded (e.g. '004821')."""
    return f"{secrets.randbelow(1_000_000):06d}"


class RegisteredUser(models.Model):
    """A user created via the Registration flow."""

    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    login_code = models.CharField(max_length=6, default=generate_login_code)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.email} ({self.first_name} {self.last_name})"


class CheckoutSubmission(models.Model):
    """A completed checkout form submission (no real payment)."""

    email = models.EmailField()
    phone_number = models.CharField(max_length=32)
    shipping_address = models.TextField()
    matched_user = models.ForeignKey(
        RegisteredUser, null=True, blank=True, on_delete=models.SET_NULL, related_name="checkouts"
    )
    was_logged_in = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Checkout by {self.email} at {self.created_at}"
