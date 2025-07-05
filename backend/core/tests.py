
from django.urls import reverse
from rest_framework.test import APITestCase
from django.contrib.auth.models import User

class RegistrationTestCase(APITestCase):
    def test_register_user(self):
        url = reverse('register_user')
        data = {
            'username': 'nowyuzytkownik',
            'password': 'tajnehaslo',
            'email': 'nowy@example.com'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertIn('token', response.data)
        self.assertTrue(User.objects.filter(username='nowyuzytkownik').exists())
