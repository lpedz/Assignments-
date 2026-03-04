import jwt
from django.contrib.auth import authenticate, get_user_model
from rest_framework import status
from rest_framework.decorators import (
    api_view, permission_classes, authentication_classes
)
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .authentication import JWTAuthentication

from .serializers import RegisterSerializer, LoginSerializer, UserSerializer
from .utils import generate_access_token, generate_refresh_token, decode_token

User = get_user_model()


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """
    Register a new user.
    POST /api/auth/register/
    Body: { "username", "email", "password", "password_confirm", "bio"(optional) }
    Returns: user data + access & refresh tokens
    """
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({
            'message': 'User registered successfully.',
            'user': UserSerializer(user).data,
            'tokens': {
                'access': generate_access_token(user),
                'refresh': generate_refresh_token(user),
            }
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    Authenticate user and return JWT tokens.
    POST /api/auth/login/
    Body: { "username", "password" }
    Returns: access & refresh tokens
    """
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = authenticate(
            username=serializer.validated_data['username'],
            password=serializer.validated_data['password']
        )
        if user is None:
            return Response(
                {'error': 'Invalid username or password.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        return Response({
            'message': 'Login successful.',
            'user': UserSerializer(user).data,
            'tokens': {
                'access': generate_access_token(user),
                'refresh': generate_refresh_token(user),
            }
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def refresh_token_view(request):
    """
    Refresh an access token using a valid refresh token.
    POST /api/auth/refresh/
    Body: { "refresh" }
    Returns: new access token
    """
    refresh_token = request.data.get('refresh')
    if not refresh_token:
        return Response(
            {'error': 'Refresh token is required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        payload = decode_token(refresh_token)
        if payload.get('type') != 'refresh':
            return Response(
                {'error': 'Invalid token type. Expected a refresh token.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        user = User.objects.get(id=payload['user_id'])
        return Response({
            'access': generate_access_token(user),
        })
    except jwt.ExpiredSignatureError:
        return Response(
            {'error': 'Refresh token has expired. Please login again.'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    except (jwt.InvalidTokenError, User.DoesNotExist):
        return Response(
            {'error': 'Invalid refresh token.'},
            status=status.HTTP_401_UNAUTHORIZED
        )


@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def profile_view(request):
    """
    Get the authenticated user's profile.
    GET /api/auth/profile/
    Header: Authorization: Bearer <access_token>
    Returns: user profile data
    """
    return Response({
        'user': UserSerializer(request.user).data,
    })
