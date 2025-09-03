
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from django.conf import settings
from django.conf.urls.static import static

# import viewsets
from .views import WasteRequestViewSet, NotificationViewSet, PaymentViewSet, RefundViewSet, CollectionDetailViewSet, RequestUpdateViewSet, WasteCategoryViewSet, StaffProfileViewSet,  CityViewSet, PickupDateViewSet, PickupDateByCityView, RegisterView, WasteRequestStatusViewSet, WasteRequestPickupViewSet, InvoiceViewSet, WasteRequestUserUpdateViewSet,CalculatePriceView,CancelWasteRequestStatusView,InvoiceUploadView,CreateRazorpayOrder,FeedbackAPIView, ContactMessageView,UserProfileView,ChangePasswordView

router = DefaultRouter()
# router.register(r'pickup-details', WasteRequestPickupViewSet, basename='pickup-detail')
# feedback = FeedbackViewSet.as_view({'post': 'create_or_update_feedback'})

router.register(r'waste-requests', WasteRequestViewSet)
router.register(r'waste-request-status', WasteRequestStatusViewSet)
router.register(r'waste-request-pickups', WasteRequestPickupViewSet, basename='waste-request-pickups')
router.register(r'user-update-request', WasteRequestUserUpdateViewSet, basename='user-update-request')
router.register(r'notifications', NotificationViewSet)
router.register(r'payments', PaymentViewSet)
router.register(r'refunds', RefundViewSet)
router.register(r'collection-details', CollectionDetailViewSet)
router.register(r'request-updates', RequestUpdateViewSet)
router.register(r'waste-categories', WasteCategoryViewSet)
router.register(r'staff', StaffProfileViewSet)
# router.register(r'users', UserViewSet)
router.register(r'cities', CityViewSet)
router.register(r'pickupdates', PickupDateViewSet)
router.register(r'invoices', InvoiceViewSet)


urlpatterns = [
    path('', include(router.urls)),
    path('cities/<int:city_id>/pickupdates/', PickupDateByCityView.as_view(), name='pickup-dates-by-city' ),
    path('register/', RegisterView.as_view(), name='register'),
    path('calculate-price/', CalculatePriceView.as_view()),
    path("user-cancel-request/<int:waste_request_id>/", CancelWasteRequestStatusView.as_view(), name="user-cancel-request"),
    path("invoices/upload/", InvoiceUploadView.as_view(), name="invoice-upload"),
    path('create-razorpay-order/', CreateRazorpayOrder.as_view()),
    path("feedback/<int:waste_request_id>/", FeedbackAPIView.as_view(), name="feedback"),
     path('contact/', ContactMessageView.as_view(), name='contact'),
   path("profile/", UserProfileView.as_view(), name="user-profile"),
   path('change-password/', ChangePasswordView.as_view(), name='change-password'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)