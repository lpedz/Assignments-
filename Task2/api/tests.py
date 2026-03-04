from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth.models import User

class ArithmeticAPIIntegrationTests(APITestCase):
    def setUp(self):
        # Create a user for testing authentication
        self.username = 'testuser'
        self.password = 'testpass123'
        self.user = User.objects.create_user(username=self.username, password=self.password)
        
        # URL for obtaining token
        self.token_url = reverse('token_obtain_pair')
        
        # Get token
        response = self.client.post(self.token_url, {'username': self.username, 'password': self.password})
        self.token = response.data['access']
        
        # Setup headers
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token)
        
        # Operation URLs
        self.add_url = reverse('add_numbers')
        self.sub_url = reverse('subtract_numbers')
        self.mul_url = reverse('multiply_numbers')
        self.div_url = reverse('divide_numbers')

    def test_authentication_required(self):
        """Ensure endpoints return 401 Unauthorized without token."""
        self.client.credentials()  # Remove authentication
        response = self.client.post(self.add_url, {'a': 5, 'b': 3})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
    def test_addition(self):
        """Test the addition endpoint with valid data."""
        data = {'a': 10, 'b': 5.5}
        response = self.client.post(self.add_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['result'], 15.5)

    def test_subtraction(self):
        """Test the subtraction endpoint with valid data."""
        data = {'a': 10, 'b': 5.5}
        response = self.client.post(self.sub_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['result'], 4.5)

    def test_multiplication(self):
        """Test the multiplication endpoint with valid data."""
        data = {'a': 10, 'b': 5.5}
        response = self.client.post(self.mul_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['result'], 55.0)

    def test_division(self):
        """Test the division endpoint with valid data."""
        data = {'a': 10, 'b': 2}
        response = self.client.post(self.div_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['result'], 5.0)

    def test_division_by_zero(self):
        """Test the division endpoint handles division by zero properly."""
        data = {'a': 10, 'b': 0}
        response = self.client.post(self.div_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
        
    def test_invalid_input(self):
        """Test that non-numeric inputs are handled gracefully."""
        data = {'a': 'invalid', 'b': 5}
        response = self.client.post(self.add_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
