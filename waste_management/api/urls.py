
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from django.conf import settings
from django.conf.urls.static import static
from django.contrib.auth import views as auth_views
from rest_framework_simplejwt.views import TokenRefreshView


# import viewsets
from .views import WasteRequestViewSet, NotificationViewSet,   CityViewSet, PickupDateViewSet, PickupDateByCityView, RegisterView, WasteRequestStatusViewSet, WasteRequestPickupViewSet, InvoiceViewSet, WasteRequestUserUpdateViewSet,CalculatePriceView,CancelWasteRequestStatusView,InvoiceUploadView,FeedbackAPIView, ContactMessageView,UserProfileView,ChangePasswordView,PasswordResetRequestView, PasswordResetConfirmView, CreateRazorpayOrderView, VerifyPaymentView,UserDashboardAPIView, MyTokenObtainPairView,StaffTokenObtainPairView,AdminTokenObtainPairView

router = DefaultRouter()

from staff.views import StaffPickupViewSet,StaffViewSet,ActiveStaffViewSet

router.register(r'waste-requests', WasteRequestViewSet)
router.register(r'waste-request-status', WasteRequestStatusViewSet)
router.register(r'waste-request-pickups', WasteRequestPickupViewSet, basename='waste-request-pickups')
router.register(r'user-update-request', WasteRequestUserUpdateViewSet, basename='user-update-request')
router.register(r'notifications', NotificationViewSet)

router.register(r'cities', CityViewSet)
router.register(r'pickupdates', PickupDateViewSet)
router.register(r'invoices', InvoiceViewSet)






# staff
# router.register(r'staff', StaffTaskViewSet, basename='staff-tasks')

router.register(r'staff/pickups', StaffPickupViewSet, basename='staff-pickups')
router.register(r'stafflist', StaffViewSet, basename='staff')
router.register(r'activestaff', ActiveStaffViewSet, basename='active-staff')

urlpatterns = [
    path('', include(router.urls)),
    
  #admin login
   path("admin/login/", AdminTokenObtainPairView.as_view(), name="admin_login"),

    # 🔹 Staff login (username only)
    # path('staff/login/', StaffLoginView.as_view(), name='staff_login'),
  path('staff/login/', StaffTokenObtainPairView.as_view(), name='staff_login'),
  
    # path("customer/login/", CustomerLoginView.as_view(), name="customer_login"),
    path('api/token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('cities/<int:city_id>/pickupdates/', PickupDateByCityView.as_view(), name='pickup-dates-by-city' ),
    path('register/', RegisterView.as_view(), name='register'),
    path('calculate-price/', CalculatePriceView.as_view()),
    path("user-cancel-request/<int:waste_request_id>/", CancelWasteRequestStatusView.as_view(), name="user-cancel-request"),
    path("invoices/upload/", InvoiceUploadView.as_view(), name="invoice-upload"),
    path('create-razorpay-order/', CreateRazorpayOrderView.as_view(), name='create-razorpay-order'),
    path('verify-payment/', VerifyPaymentView.as_view(), name='verify-payment'),

    # path('create-razorpay-order/', CreateRazorpayOrder.as_view()),
    path("feedback/<int:waste_request_id>/", FeedbackAPIView.as_view(), name="feedback"),
    path('contact/', ContactMessageView.as_view(), name='contact'),
   path("profile/", UserProfileView.as_view(), name="user-profile"),
   path('password-reset/', PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('reset/<str:uid>/<str:token>/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
   path('change-password/', ChangePasswordView.as_view(), name='change-password'),
path("user-dashboard/", UserDashboardAPIView.as_view(), name="user-dashboard"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)