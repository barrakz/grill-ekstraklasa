
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
        self.assertFalse(response.data['is_staff'])
        self.assertTrue(User.objects.filter(username='nowyuzytkownik').exists())


class LoginTestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='staffuser',
            password='tajnehaslo',
            is_staff=True,
        )

    def test_login_returns_staff_flag(self):
        url = reverse('api_token_auth')
        response = self.client.post(
            url,
            {'username': 'staffuser', 'password': 'tajnehaslo'},
            format='json',
        )

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data['is_staff'])
