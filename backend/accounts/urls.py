from django.urls import path

from . import views

urlpatterns = [
    path("health/", views.health, name="health"),
    path("register/", views.register, name="register"),
    path("check-email/", views.check_email, name="check-email"),
    path("verify-code/", views.verify_code, name="verify-code"),
    path("checkout/", views.submit_checkout, name="submit-checkout"),
]
