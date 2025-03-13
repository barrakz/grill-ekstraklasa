from django.http import HttpResponse


def home(request):
    return HttpResponse("<h1>Grill Ekstraklasa – Backend API działa!</h1>")
