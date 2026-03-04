from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

def get_numbers(request):
    try:
        a = float(request.data.get('a', 0))
        b = float(request.data.get('b', 0))
        return a, b, None
    except (TypeError, ValueError):
        return None, None, "Invalid input. Both 'a' and 'b' must be numbers."

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_numbers(request):
    a, b, error = get_numbers(request)
    if error:
        return Response({"error": error}, status=400)
    return Response({"result": a + b})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def subtract_numbers(request):
    a, b, error = get_numbers(request)
    if error:
        return Response({"error": error}, status=400)
    return Response({"result": a - b})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def multiply_numbers(request):
    a, b, error = get_numbers(request)
    if error:
        return Response({"error": error}, status=400)
    return Response({"result": a * b})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def divide_numbers(request):
    a, b, error = get_numbers(request)
    if error:
        return Response({"error": error}, status=400)
    if b == 0:
        return Response({"error": "Cannot divide by zero."}, status=400)
    return Response({"result": a / b})
