# adminpanel/urls.py
from django.urls import path
from .views import AdminUserListView,AdminWasteRequestListView,AdminUserUpdateListView,AdminUserCancelledListView,AdminUserCancelRequestUpdateView,AdminUserProfileView,ContactMessageListView,ContactMessageDetailView,PickupDateCreateView,CreateStaffAPIView,StaffAssignAreasAPIView,AreaListAPIView,DashboardSummaryAPIView,AdminPickupAPIView,DashboardTrendsAPIView,StaffPerformanceAPIView
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
path("messages/", ContactMessageListView.as_view(), name="admin-messages"),
path("messages/<int:pk>/", ContactMessageDetailView.as_view(), name="admin-message-detail"),
path('pickupdates/', PickupDateCreateView.as_view(), name='pickupdate-create'),
path('staff/create/', CreateStaffAPIView.as_view(), name='create-staff'),
path('staff/<int:staff_id>/assign-areas/', StaffAssignAreasAPIView.as_view(), name='staff-assign-areas'),
path('areas/', AreaListAPIView.as_view(), name='area-list'),
path("dashboard/summary/", DashboardSummaryAPIView.as_view(), name="dashboard-summary"),
path('pickups/today/', AdminPickupAPIView.as_view(), name='admin-today-pickups'),
 path("dashboard/trends/", DashboardTrendsAPIView.as_view(), name="dashboard-trends"),
 path('staff-performance/', StaffPerformanceAPIView.as_view(), name='staff-performance'),

    
]
