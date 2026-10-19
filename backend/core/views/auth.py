from django.contrib.auth import authenticate, login, logout
from django.middleware.csrf import get_token
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect, ensure_csrf_cookie
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from ..permissions import IsStaffUser
from ..throttles import LoginRateThrottle


def user_payload(user):
    return {"username": user.get_username(), "email": user.email}


@method_decorator(ensure_csrf_cookie, name="dispatch")
class CsrfView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        return Response({"detail": "CSRF cookie set.", "csrfToken": get_token(request)})


@method_decorator(csrf_protect, name="dispatch")
class LoginView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [LoginRateThrottle]

    def post(self, request):
        username = str(request.data.get("username", "")).strip()
        password = str(request.data.get("password", ""))
        user = authenticate(request, username=username, password=password)
        # Same message for every failure so attackers learn nothing.
        if user is None or not user.is_staff or not user.is_active:
            return Response({"detail": "Invalid username or password."}, status=401)
        login(request, user)
        return Response(user_payload(user))


class LogoutView(APIView):
    permission_classes = [IsStaffUser]

    def post(self, request):
        logout(request)
        return Response(status=204)


class MeView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        user = request.user
        if user.is_authenticated and user.is_staff and user.is_active:
            return Response({"authenticated": True, "user": user_payload(user)})
        return Response({"authenticated": False})