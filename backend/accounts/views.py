from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import CheckoutSubmission, RegisteredUser
from .serializers import CheckoutSerializer, RegisterSerializer


@api_view(["GET"])
def health(request):
    """Simple deployment health check."""
    return Response({"status": "ok"})


@api_view(["POST"])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save(email=serializer.validated_data["email"])
    return Response(
        {
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "login_code": user.login_code,
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["GET"])
def check_email(request):
    email = (request.query_params.get("email") or "").lower().strip()
    if not email:
        return Response({"detail": "email query param is required."}, status=status.HTTP_400_BAD_REQUEST)

    user = RegisteredUser.objects.filter(email=email).first()
    if user:
        return Response({"registered": True, "first_name": user.first_name})
    return Response({"registered": False})


@api_view(["POST"])
def verify_code(request):
    email = (request.data.get("email") or "").lower().strip()
    code = (request.data.get("code") or "").strip()

    user = RegisteredUser.objects.filter(email=email).first()
    if user and user.login_code == code:
        return Response(
            {
                "success": True,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
            }
        )
    return Response({"success": False, "detail": "Invalid code."}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
def submit_checkout(request):
    serializer = CheckoutSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    email = serializer.validated_data["email"].lower().strip()
    matched_user = RegisteredUser.objects.filter(email=email).first()
    was_logged_in = bool(request.data.get("was_logged_in", False))

    submission = CheckoutSubmission.objects.create(
        email=email,
        phone_number=serializer.validated_data["phone_number"],
        shipping_address=serializer.validated_data["shipping_address"],
        matched_user=matched_user,
        was_logged_in=was_logged_in,
    )
    return Response({"id": submission.id, "created_at": submission.created_at}, status=status.HTTP_201_CREATED)
