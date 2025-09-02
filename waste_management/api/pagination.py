from rest_framework.pagination import PageNumberPagination

class CustomPagination(PageNumberPagination):
    page_size = 10  # fallback default
    page_size_query_param = "page_size"  # allow frontend control
    max_page_size = 100  # (optional) to prevent abuse
