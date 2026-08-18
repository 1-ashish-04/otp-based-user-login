import re

from rest_framework import serializers

from .models import RegisteredUser, CheckoutSubmission

# Optional leading +, then 7-15 digits once separators are stripped.
PHONE_RE = re.compile(r"^\+?\d{7,15}$")


# Letters, spaces, apostrophes, hyphens — covers most real names (O'Brien, Mary-Jane, etc.)
NAME_RE = re.compile(r"^[A-Za-z][A-Za-z\s'\-]{0,149}$")


class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegisteredUser
        fields = ["email", "first_name", "last_name"]

    def validate_email(self, value):
        value = value.lower().strip()
        if RegisteredUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value

    def validate_first_name(self, value):
        return self._validate_name(value, "First name")

    def validate_last_name(self, value):
        return self._validate_name(value, "Last name")

    @staticmethod
    def _validate_name(value, label):
        value = (value or "").strip()
        if not NAME_RE.match(value):
            raise serializers.ValidationError(f"{label} should only contain letters, spaces, hyphens, or apostrophes.")
        return value


class CheckoutSerializer(serializers.ModelSerializer):
    class Meta:
        model = CheckoutSubmission
        fields = ["email", "phone_number", "shipping_address"]

    def validate_phone_number(self, value):
        stripped = re.sub(r"[\s\-()]", "", value or "")
        if not PHONE_RE.match(stripped):
            raise serializers.ValidationError(
                "Enter a valid phone number (7-15 digits, optional + and country code)."
            )
        return value