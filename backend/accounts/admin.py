from django.contrib import admin
from .models import RegisteredUser, CheckoutSubmission

# Register your models here.

class RegisteredUserAdmin(admin.ModelAdmin):
    list_display = ["email", "first_name", "last_name", "login_code", "created_at"]
    search_fields = ["email", "first_name", "last_name"]


class CheckoutSubmissionAdmin(admin.ModelAdmin):
    list_display = ["email", "phone_number", "was_logged_in", "matched_user", "created_at"]
    search_fields = ["email", "phone_number"]

admin.site.register(RegisteredUser, RegisteredUserAdmin)
admin.site.register(CheckoutSubmission, CheckoutSubmissionAdmin)