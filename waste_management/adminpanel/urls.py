# adminpanel/urls.py
from django.urls import path
from .views import AdminUserListView,AdminWasteRequestListView,AdminUserUpdateListView,AdminUserCancelledListView,AdminUserCancelRequestUpdateView,AdminUserProfileView

urlpatterns = [
    path('users/', AdminUserListView.as_view(), name='admin-user-list'),
    path('users/<int:user_id>/waste-requests/', AdminWasteRequestListView.as_view(), name='admin-user-waste-requests'),
    path('users/<int:user_id>/user-updates/', AdminUserUpdateListView.as_view(), name='admin-user-updates'),
    path('users/<int:user_id>/user-cancel/', AdminUserCancelledListView.as_view(), name='admin-user-cancel'),
    path(
    "user-cancel-request/<int:pk>/",
    AdminUserCancelRequestUpdateView.as_view(),
    name="admin-user-cancel-request",
),
path(
    'users/<int:user_id>/profile/',
    AdminUserProfileView.as_view(),
    name='admin-user-profile'
),
    
]
