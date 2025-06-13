from rest_framework.pagination import PageNumberPagination

class StandardResultsSetPagination(PageNumberPagination):
    """
    Standardowa klasa paginacji do użycia w widokach, które wymagają paginacji.
    Nie wpływa na widoki, które jej nie używają.
    """
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100
