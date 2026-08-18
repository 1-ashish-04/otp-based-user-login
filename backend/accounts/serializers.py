from rest_framework import serializers

from .models import RegisteredUser, CheckoutSubmission


class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegisteredUser
        fields = ["email", "first_name", "last_name"]

    def validate_email(self, value):
        value = value.lower().strip()
        if RegisteredUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value


class CheckoutSerializer(serializers.ModelSerializer):
    class Meta:
        model = CheckoutSubmission
        fields = ["email", "phone_number", "shipping_address"]
