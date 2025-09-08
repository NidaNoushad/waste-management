
from rest_framework import viewsets
import razorpay
from datetime import date
from .pagination import CustomPagination
from django.core.mail import send_mail
from django.conf import settings
from rest_framework import viewsets, permissions, generics
from rest_framework.parsers import MultiPartParser, FormParser
from django.views.decorators.csrf import csrf_exempt
from decimal import Decimal
from django.utils.decorators import method_decorator
from rest_framework import serializers
import logging
# from .utils.invoice_utils import  save_invoice
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode
from django.contrib.auth import get_user_model

from .utils import calculate_pickup_price
from django.utils.timezone import now
# from rest_framework.viewsets import ReadOnlyModelViewSet
from rest_framework.views import APIView

from rest_framework.views import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count
# from rest_framework.pagination import PageNumberPagination



# from django.utils import timezone
from datetime import date, timedelta
# from datetime import datetime, date
from datetime import datetime, date
from django.utils import timezone
import datetime
from dateutil.relativedelta import relativedelta
from django.contrib.auth.models import User
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAuthenticatedOrReadOnly
from .models import WasteRequest, Notification, Payment, Refund,  City, PickupDate, WasteRequestStatus, Invoice,WasteRequestPickup, WasteRequestUserUpdate,WasteRequestCancelled,Feedback,UserProfile
from .serializers import WasteRequestSerializer, NotificationSerializer, PaymentSerializer, RefundSerializer,   CitySerializer, PickupDateSerializer, RegisterSerializer, WasteRequestStatusSerializer, InvoiceSerializer,WasteRequestUserUpdateSerializer,FeedbackSerializer,ContactMessageSerializer,UserProfileSerializer,ChangePasswordSerializer,PasswordResetRequestSerializer, PasswordResetConfirmSerializer,MyTokenObtainPairSerializer,StaffTokenObtainPairSerializer
# ,CustomerTokenObtainPairSerializer,StaffTokenObtainPairSerializer
# ,MyTokenObtainPairSerializer

class StaffTokenObtainPairView(TokenObtainPairView):
    serializer_class = StaffTokenObtainPairSerializer

# Create your views here.
razorpay_client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

logger = logging.getLogger(__name__)
class CreateRazorpayOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        """
        Create Razorpay order with auto-capture enabled
        """
        try:
            amount = request.data.get('amount')
            if not amount:
                return Response({'error': 'Amount is required'}, status=400)

            # Convert to paisa (Razorpay expects amount in paisa)
            amount_in_paisa = int(float(amount) * 100)

            # Create order
            order_data = {
                'amount': amount_in_paisa,
                'currency': 'INR',
                'payment_capture': 1,  # Auto-capture
                'notes': {
                    'user_id': request.user.id,
                    'email': request.user.email
                }
            }

            order = razorpay_client.order.create(data=order_data)

            return Response({
                'id': order['id'],
                'amount': order['amount'],
                'currency': order['currency'],
                'status': order['status']
            }, status=201)

        except Exception as e:
            print(f"Razorpay order creation error: {str(e)}")
            return Response({'error': 'Failed to create payment order'}, status=500)


class VerifyPaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        """
        Verify Razorpay payment signature
        """
        try:
            razorpay_order_id = request.data.get('razorpay_order_id')
            razorpay_payment_id = request.data.get('razorpay_payment_id')
            razorpay_signature = request.data.get('razorpay_signature')
            waste_request_id = request.data.get('waste_request_id')  
            

            params_dict = {
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature
            }

            try:
                razorpay_client.utility.verify_payment_signature(params_dict)

                # Fetch payment details
                payment = razorpay_client.payment.fetch(razorpay_payment_id)

                if waste_request_id:
                    # from .models import WasteRequest  
                    try:
                        waste_request = WasteRequest.objects.get(id=waste_request_id)
                        waste_request.payment_status = "Paid"
                        waste_request.transaction_id = razorpay_payment_id
                        waste_request.razorpay_order_id = razorpay_order_id
                        waste_request.razorpay_signature = razorpay_signature
                        waste_request.save()
                    except WasteRequest.DoesNotExist:
                        return Response({"error": "Waste request not found"}, status=404)

                return Response({
                    'status': 'success',
                    'payment_id': razorpay_payment_id,
                    'payment_status': payment['status'],
                    'amount': payment['amount'] / 100,  # rupees
                    'method': payment['method']
                })

            except razorpay.errors.SignatureVerificationError:
                return Response({'error': 'Invalid payment signature'}, status=400)

        except Exception as e:
            print(f"Payment verification error: {str(e)}")
            return Response({'error': 'Payment verification failed'}, status=500)



# class CreateRazorpayOrder(APIView):
    
#     permission_classes = [IsAuthenticated]

#     def post(self, request):
#         amount = request.data.get("amount")
#         email = request.data.get("email") 
#         contact = request.data.get("contact") 
#         if not amount or amount <= 0:
#             return Response({"error": "Invalid amount"}, status=400)

#         try:
#             data = {
#                 "amount": int(amount * 100),  # paise
#                 "currency": "INR",
#                 "payment_capture": 1,
#                  "notes": {                     
#                     "email": email,
#                     "contact": contact
#                 }
#             }
#             razorpay_order = client.order.create(data)
#             return Response({
#                 "razorpay_order_id": razorpay_order['id'],
#                 "amount": data['amount'],
#                 "currency": data['currency'],
#             })
#         except Exception as e:
#             return Response({"error": str(e)}, status=400)

# def initiate_razorpay_refund(transaction_id, amount):
#     """
#     Initiate refund through Razorpay
    
#     Args:
#         transaction_id (str): Razorpay payment ID
#         amount (float): Amount to refund
    
#     Returns:
#         dict: Refund details or error info
#     """
#     try:
#         # Convert amount to paise (Razorpay uses paise)
#         refund_amount = int(float(amount) * 100)
        
#         # Create refund
#         refund = razorpay_client.payment.refund(transaction_id, {
#             "amount": refund_amount,
#             "speed": "optimum",  # or "normal"
#             "notes": {
#                 "reason": "User cancellation",
#                 "initiated_by": "system"
#             }
#         })
        
#         logger.info(f"Refund successful: {refund['id']} for payment: {transaction_id}")
        
#         return {
#             "success": True,
#             "refund_id": refund['id'],
#             "status": refund['status'],  # "processed", "pending", etc.
#             "amount": float(refund['amount']) / 100,  # Convert back from paise
#             "created_at": refund['created_at'],
#             "razorpay_response": refund
#         }
        
#     except razorpay.errors.BadRequestError as e:
#         logger.error(f"Razorpay bad request: {str(e)}")
#         return {
#             "success": False,
#             "error": f"Invalid request: {str(e)}",
#             "status": "failed"
#         }
        
#     except razorpay.errors.ServerError as e:
#         logger.error(f"Razorpay server error: {str(e)}")
#         return {
#             "success": False,
#             "error": "Payment service unavailable",
#             "status": "failed"
#         }
        
#     except Exception as e:
#         logger.error(f"Refund failed: {str(e)}")
#         return {
#             "success": False,
#             "error": str(e),
#             "status": "failed"
#         }



def initiate_razorpay_refund(transaction_id, old_amount, new_amount=None, reason="cancel"):
    """
    Handle refund through Razorpay for both update and cancel cases.

    Args:
        transaction_id (str): Razorpay payment ID
        old_amount (float): Original amount paid
        new_amount (float, optional): New amount after update (only for update case)
        reason (str): "update" or "cancel"

    Returns:
        dict: Refund details or status
    """
    try:
        refund_amount = 0.0

        # Case 1: Cancel → refund full amount
        if reason == "cancel":
            refund_amount = old_amount  

        # Case 2: Update → refund only difference if new < old
        elif reason == "update" and new_amount is not None:
            if new_amount < old_amount:
                refund_amount = old_amount - new_amount
            else:
                return {
                    "success": False,
                    "message": "No refund, extra payment required",
                    "extra_payment": new_amount - old_amount
                }

        # If no refund required
        if refund_amount <= 0:
            return {"success": True, "message": "No refund required"}

        # Convert to paise
        refund_paise = int(refund_amount * 100)

        # Create refund in Razorpay
        refund = razorpay_client.payment.refund(transaction_id, {
            "amount": refund_paise,
            "speed": "optimum",
            "notes": {
                "reason": reason.capitalize(),
                "initiated_by": "system"
            }
        })

        logger.info(f"Refund successful: {refund['id']} for payment: {transaction_id}")

        return {
            "success": True,
            "refund_id": refund['id'],
            "status": refund['status'],
            "amount": refund_amount,
            "created_at": refund['created_at'],
            "razorpay_response": refund
        }

    except razorpay.errors.BadRequestError as e:
        logger.error(f"Razorpay bad request: {str(e)}")
        return {"success": False, "error": f"Invalid request: {str(e)}", "status": "failed"}

    except razorpay.errors.ServerError as e:
        logger.error(f"Razorpay server error: {str(e)}")
        return {"success": False, "error": "Payment service unavailable", "status": "failed"}

    except Exception as e:
        logger.error(f"Refund failed: {str(e)}")
        return {"success": False, "error": str(e), "status": "failed"}





class RegisterView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



# class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
#     @classmethod
#     def get_token(cls, user):
#         token = super().get_token(user)
#         token['email'] = user.email
#         return token

#     def validate(self, attrs):
#         email = attrs.get("email")
#         password = attrs.get("password")

#         # find user by email
#         try:
#             user = User.objects.get(email=email)
#         except User.DoesNotExist:
#             raise serializers.ValidationError("No account found with this email.")

#         # check password
#         if not user.check_password(password):
#             raise serializers.ValidationError("Invalid password.")

#         if not user.is_active:
#             raise serializers.ValidationError("This account is inactive.")

#         # call parent with username (JWT requires username internally)
#         data = super().validate({
#             "username": user.username,
#             "password": password
#         })

#         data["email"] = user.email
#         return data

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

# class StaffLoginView(TokenObtainPairView):
#     serializer_class = StaffTokenObtainPairSerializer


# views.py
# class StaffLoginView(TokenObtainPairView):
#     serializer_class = MyTokenObtainPairSerializer
    
#     def get_serializer(self, *args, **kwargs):
#         kwargs['is_staff_login'] = True
#         return super().get_serializer(*args, **kwargs)

# class CustomerLoginView(TokenObtainPairView):
#     serializer_class = MyTokenObtainPairSerializer
    
#     def get_serializer(self, *args, **kwargs):
#         kwargs['is_staff_login'] = False
#         return super().get_serializer(*args, **kwargs)


# class MyTokenObtainPairView(TokenObtainPairView):
#     serializer_class = MyTokenObtainPairSerializer
# class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
#     username = serializers.CharField(required=False, allow_blank=True)
#     email = serializers.EmailField(required=False, allow_blank=True)
#     password = serializers.CharField(write_only=True)

#     @classmethod
#     def get_token(cls, user):
#         token = super().get_token(user)
#         token['email'] = user.email
#         token['username'] = user.username
#         token['is_staff'] = user.is_staff
#         return token

#     def validate(self, attrs):
#         username = attrs.get("username")
#         email = attrs.get("email")
#         password = attrs.get("password")

#         if not password:
#             raise serializers.ValidationError("Password is required.")

#         user = None

#         # 🔹 Staff login with username
#         if username:
#             try:
#                 user = User.objects.get(username=username)
#                 if not user.is_staff:
#                     raise serializers.ValidationError("Only staff can log in with username.")
#             except User.DoesNotExist:
#                 raise serializers.ValidationError("Invalid staff username.")

#         # 🔹 Customer login with email
#         elif email:
#             try:
#                 user = User.objects.get(email=email)
#                 if user.is_staff:
#                     raise serializers.ValidationError("Staff must log in with username, not email.")
#             except User.DoesNotExist:
#                 raise serializers.ValidationError("Invalid customer email.")

#         else:
#             raise serializers.ValidationError("Provide email (for customers) or username (for staff).")

#         # 🔹 Password check
#         if not user.check_password(password):
#             raise serializers.ValidationError("Invalid password.")

#         if not user.is_active:
#             raise serializers.ValidationError("This account is inactive.")

#         # ✅ Continue JWT generation
#         data = super().validate({
#             "username": user.username,  # JWT still needs username internally
#             "password": password
#         })

#         data["email"] = user.email
#         data["username"] = user.username
#         data["is_staff"] = user.is_staff
#         return data





class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        
        if serializer.is_valid():
            try:
                serializer.save()
                return Response({
                    'message': 'Password reset email sent successfully.'
                }, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({
                    'error': 'Failed to send email. Please try again later.'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({
            'error': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request, uid, token):
        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)
            
            if not default_token_generator.check_token(user, token):
                return Response({
                    'error': 'Invalid or expired token.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            serializer = PasswordResetConfirmSerializer(data=request.data)
            
            if serializer.is_valid():
                user.set_password(serializer.validated_data['new_password1'])
                user.save()
                
                return Response({
                    'message': 'Password reset successful.'
                }, status=status.HTTP_200_OK)
            else:
                print(serializer.errors) 

            
                return Response({
                'error': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({
                'error': 'Invalid reset link.'
            }, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            old_password = serializer.validated_data['old_password']

            # Check old password
            if not user.check_password(old_password):
                return Response({"error": "Old password is incorrect"}, status=status.HTTP_400_BAD_REQUEST)

            # Set new password
            user.set_password(serializer.validated_data['new_password'])
            user.save()

            return Response({"message": "Password changed successfully"}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class PickupDateByCityView(APIView):
    permission_classes=[AllowAny]

    def get(self,request, city_id):
        today=date.today()
        dates = PickupDate.objects.filter(city_id=city_id, date__gte=today).order_by('date')
        serializer = PickupDateSerializer(dates, many=True)
        return Response(serializer.data)


class PickupDateViewSet(viewsets.ReadOnlyModelViewSet):
    queryset=PickupDate.objects.all()
    serializer_class=PickupDateSerializer
    permission_classes=[AllowAny]

    def get_queryset(self):
        return PickupDate.objects.filter(date__gte=date.today()).order_by('date')
    



class CityViewSet(viewsets.ReadOnlyModelViewSet):
    queryset=City.objects.all()
    serializer_class=CitySerializer
    permission_classes=[AllowAny]
    pagination_class = None



class CalculatePriceView(APIView):
    permission_classes = [IsAuthenticated] 
    def post(self, request):
        data = request.data
        price_data = calculate_pickup_price(
            waste_type=data.get("waste_type"),
            weight=data.get("weight"),
            economy_weight_option=data.get("economyWeightOption"),
            frequency=data.get("frequency"),
            duration=data.get("duration") or 1,
            urgency=data.get("urgency") or "notUrgent"
        )
        return Response(price_data)
   

class WasteRequestViewSet(viewsets.ModelViewSet):
    queryset=WasteRequest.objects.all()
    serializer_class=WasteRequestSerializer
    permission_classes = [IsAuthenticated]


    def perform_create(self, serializer):
     data = serializer.validated_data
     pickup_dates = data.get("pickup_dates") or []
    #  economy_weight_option=data.get("economy_weight_option") or data.get("economyWeightOption"),
     economy_weight_option = data.get("economy_weight_option") 


    # Calculate total price for all pickups
     price_data = calculate_pickup_price(
        waste_type=data.get("waste_type"),
        weight=data.get("weight"),
        # economy_weight_option=data.get("economy_weight_option"),
        economy_weight_option=economy_weight_option,
        frequency=data.get("frequency"),
        duration=len(pickup_dates) or 1,
        urgency=data.get("urgency") or "notUrgent"
    )

    # Save main WasteRequest
     instance = serializer.save(
        user=self.request.user,
        economy_weight_option=economy_weight_option,
        base_price=price_data["base_price"],
        gstAmount=price_data["gst_amount"],
        final_amount=price_data["final_amount"],
        additional_charges=price_data["extra_charge"], 
      
    )

    # Create per-date updates
     num_dates = len(pickup_dates) or 1
     per_date_amount = (price_data["final_amount"] or 0) / num_dates
     per_date_base = (price_data["base_price"] or 0) / num_dates
     per_date_gst = (price_data["gst_amount"] or 0) / num_dates
  

     for d in pickup_dates:
        if isinstance(d, str):
         pickup_date = datetime.datetime.strptime(d, "%Y-%m-%d").date()
        else:
          pickup_date = d


        WasteRequestUserUpdate.objects.create(
            waste_request=instance,
            pickup_date=d if isinstance(d, datetime.date) else datetime.datetime.strptime(d, "%Y-%m-%d").date(),
            final_amount=round(per_date_amount, 2),
            base_price=round(per_date_base, 2),
            gstAmount=round(per_date_gst, 2),
            updated_by=self.request.user,
            waste_type=data.get("waste_type"),
            category=data.get("category"),
            weight=data.get("weight"),
            is_manual=False
        )

    @action(detail=False, methods=['get'])
    def my_orders(self, request):
        """Return only current user's order IDs"""
        qs = WasteRequest.objects.filter(user=request.user).order_by("-created_at")
        data = [{"order_id": o.order_id} for o in qs]
        return Response(data)

    @action(detail=True, methods=['post'])     
    def confirm_payment(self, request, pk=None):         
        order = self.get_object()         
        payment_method = request.data.get('payment_method')         
        razorpay_payment_id = request.data.get('razorpay_payment_id')
        transaction_id = request.data.get('transaction_id')  # 🔥 ADD THIS LINE
          
        if payment_method not in ["Cash on Pickup", "UPI", "Card"]:             
            return Response({"error": "Invalid payment method"}, status=status.HTTP_400_BAD_REQUEST)          

        order.payment_method = payment_method         
             
    # Payment status logic         
        if payment_method == "Cash on Pickup":           
            order.payment_status = "Pending"         
        elif payment_method in ["UPI", "Card"]:             
            if razorpay_payment_id or transaction_id:  # 🔥 UPDATED CONDITION
                order.payment_status = "Paid"                 
                order.transaction_id = razorpay_payment_id or transaction_id  # 🔥 UPDATED
            else:                 
                order.payment_status = "Pending"         
                 
        order.save()  # save the order first                 

    # 🔥 SEND EMAIL FOR ALL PAYMENT METHODS
        try:                 
            print(f"Sending email to: {order.email}")
        
        # Format pickup dates for display
            pickup_dates_str = "Not specified"
            if order.pickup_dates and len(order.pickup_dates) > 0:
                if len(order.pickup_dates) == 1:
                    pickup_dates_str = order.pickup_dates[0]
                else:
                    pickup_dates_str = ", ".join(order.pickup_dates)

        # Different email content based on payment method
            if payment_method == "Cash on Pickup":
                email_subject = "Order Confirmation - TrashGo (Cash on Pickup)"
                email_message = f"""Hello {order.name},

Your order #{order.order_id} has been confirmed!

Order Details:
- Order ID: #{order.order_id}
- Waste Type: {order.waste_type or 'Not specified'}
- Category: {order.category or 'Not specified'}
- Weight: {order.weight or 'Not specified'} kg
- Pickup Address: {order.address}
- Pickup Dates: {pickup_dates_str}
- Payment Method: Cash on Pickup
- Amount to Pay: ₹{order.final_amount}

Our team will pick up your waste on the scheduled date(s). Please have the exact amount ready for payment.

Thank you for choosing TrashGo!

Best regards,
TrashGo Team"""

            elif payment_method in ["UPI", "Card"]:
                email_subject = "Payment Successful - TrashGo"
                email_message = f"""Hello {order.name},

Your payment has been successfully processed!

Order Details:
- Order ID: #{order.order_id}
- Waste Type: {order.waste_type or 'Not specified'}
- Category: {order.category or 'Not specified'}
- Weight: {order.weight or 'Not specified'} kg
- Pickup Address: {order.address}
- Pickup Dates: {pickup_dates_str}
- Payment Method: {order.payment_method}
- Payment Status: {order.payment_status}
- Transaction ID: {order.transaction_id or 'N/A'}
- Amount Paid: ₹{order.final_amount}

Our team will pick up your waste on the scheduled date(s).

Thank you for choosing TrashGo!

Best regards,
TrashGo Team"""
            if hasattr(order.user, "profile") and getattr(order.user.profile, "email_notifications", True):
             send_mail(                 
            subject=email_subject,                 
            message=email_message,                 
            from_email=settings.DEFAULT_FROM_EMAIL,                 
            recipient_list=[order.email],                 
            fail_silently=False,                 
        )                 
             print("Email sent successfully")
            else:
             print("User disabled email notifications, skipping email.")             
        except Exception as e:                  
            print(f"Email sending failed: {e}")                      

        return Response({             
        "message": "Payment confirmed and email sent.",             
        "order_id": order.id,             
        "payment_method": order.payment_method,             
        "payment_status": order.payment_status,
        "transaction_id": order.transaction_id,  # 🔥 INCLUDE IN RESPONSE
    })


        

   

   
   
   


class WasteRequestStatusViewSet(viewsets.ModelViewSet):
    queryset = WasteRequestStatus.objects.all()
    serializer_class = WasteRequestStatusSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # If normal user, only show their requests
        if not self.request.user.is_staff:
            return self.queryset.filter(waste_request__user=self.request.user)
        return self.queryset

# history
class WasteRequestPickupViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    pagination_class = CustomPagination 
    #pagination_class = WasteRequestPickupPagination

    def list(self, request):
        qs = WasteRequest.objects.all().order_by("-created_at")
       

        # Restrict to only current user's requests if not staff
        if not request.user.is_staff:
            qs = qs.filter(user=request.user)

        flat_rows = []
        for req in qs:
            per_date_breakdown = WasteRequestSerializer(req).data.get("per_date_breakdown", {})
            breakdown_dict = {item["pickup_date"]: item["updated_amount"] for item in per_date_breakdown.get("breakdown", [])}
            for d in (req.pickup_dates or []):
                # Check if user has updated this pickup
                # Calculate per-pickup amount
                total_pickups = len(req.pickup_dates or [])
                per_pickup_amount = req.final_amount / max(total_pickups, 1)
                
                
                user_update = WasteRequestUserUpdate.objects.filter(
                 waste_request=req,
                 pickup_date=d
                     ).first()
                # Get the status for this specific pickup date
                status_obj = WasteRequestStatus.objects.filter(
                    waste_request=req, pickup_date=d
                ).first()
                status = status_obj.status if status_obj else "Pending"
                # find cancelled record for this pickup_date
                cancelled = req.cancelled_pickups.filter(pickup_date=d).first()
                # for pickup in req.pickups.all():  # <-- use related_name 'pickups'
                #  status = pickup.status 
                        # ✅ Fetch all feedbacks for this pickup date
                feedbacks = list(req.feedbacks.filter(pickup_date=d).values("comment", "rating", "pickup_date"))
                flat_rows.append({
                    "id": req.id,
                    "waste_request_id": req.id, 
                    # "pickup_id": pickup.id,
                    "order_id": req.order_id,
                    "pickup_date": d,
                     "waste_type": user_update.waste_type if user_update else req.waste_type,
                     "category": user_update.category if user_update else req.category,
                    "payment_method": req.payment_method,
                    "payment_status": req.payment_status,
                    "transaction_id": req.transaction_id if req.payment_method != "Cash on Pickup" else None, 
                    "urgency":req.urgency,
                    "status": status,
                    "address": user_update.address if (user_update and user_update.address) else req.address,
                    "email": user_update.email if (user_update and user_update.email) else req.email,
                    "weight": user_update.weight if (user_update and user_update.weight) else req.weight,  # ✅ added weight
                    "amount": breakdown_dict.get(str(d), 0),
                    "per_date_amount": per_pickup_amount,
                    "refund_id": cancelled.refund_id if cancelled else None,
                    "refund_status": cancelled.refund_status if cancelled else None,
                    "refund_amount": cancelled.refund_amount if cancelled else None,
                   
                    # "address": req.address,
                    # "email":req.email,
                    # "invoice_url": req.invoice_url,   # add this
                    "can_update": status in ["Assigned", "Pending"],  # matches frontend logic
                    "can_cancel": status in ["Assigned", "Pending"],  # same
                    "invoice_url": req.invoices.first().invoice_file.url if req.invoices.exists() else None,
                    "feedbacks": feedbacks
                    # "feedback_rating": feedback_obj.rating if feedback_obj else None,
                    # "feedback_comment": feedback_obj.comment if feedback_obj else None
                })
        status_filter = request.query_params.get("status")
        if status_filter and status_filter != "all":
         flat_rows = [row for row in flat_rows if row['status'] == status_filter]

        paginator = self.pagination_class()
        page = paginator.paginate_queryset(flat_rows, request)
        return paginator.get_paginated_response(page)

class WasteRequestUserUpdateViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = WasteRequestUserUpdateSerializer
  

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)

    def update(self, request, pk=None):
        """
        Update user-editable fields for a specific pickup date
        pk = WasteRequest id
        Body = { pickup_date, waste_type, weight, economy_weight_option, category, address, email }
        """
        pickup_date = request.data.get("pickup_date")
        if not pickup_date:
            return Response({"detail": "pickup_date is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            req = WasteRequest.objects.get(id=pk)
        except WasteRequest.DoesNotExist:
            return Response({"detail": "WasteRequest not found"}, status=status.HTTP_404_NOT_FOUND)

        # Only allow user-editable fields
        allowed_fields = ["waste_type", "weight", "economy_weight_option", "category", "address", "email", "base_price", "gstAmount", "final_amount" ]
        update_data = {k: v for k, v in request.data.items() if k in allowed_fields}

        user_update, created = WasteRequestUserUpdate.objects.get_or_create(
            waste_request=req,
            pickup_date=pickup_date,
            defaults={"updated_by": request.user, **update_data}
        )

        if not created:
            # overwrite existing record with latest data
            has_changes = False
            for k, v in update_data.items():
                old_value = getattr(user_update, k)
                if str(old_value) != str(v):   # only if actual change
                     setattr(user_update, k, v)
                     has_changes = True

            user_update.updated_by = request.user
            user_update.is_manual = has_changes 
            user_update.save()
        else:
    # If newly created via user update, mark manual too
            user_update.is_manual = True
            user_update.save()

        # Return all updated fields + order info
        response_data = {
            "order_id": req.order_id,
            "pickup_date": pickup_date,
        }
        # response_data.update(update_data)
        
        serializer = WasteRequestUserUpdateSerializer(user_update)
        return Response(serializer.data, status=status.HTTP_200_OK)



# class CancelWasteRequestStatusView(generics.UpdateAPIView):
#     """
#     PUT /api/user-cancel-request/<waste_request_id>/
#     Body: { "pickup_date": "YYYY-MM-DD" }
#     """
#     queryset = WasteRequestStatus.objects.all()
#     serializer_class = WasteRequestStatusSerializer
#     permission_classes = [permissions.IsAuthenticated]

#     def put(self, request, *args, **kwargs):
#         waste_request_id = self.kwargs.get("waste_request_id")
#         pickup_date = request.data.get("pickup_date")
#         payment_method = request.data.get("payment_method", "Cash on Pickup")
#         transaction_id = request.data.get("transaction_id")
#         final_amount = request.data.get("final_amount")

#         if not pickup_date:
#             return Response({"detail": "pickup_date is required"}, status=400)

#         try:
#             waste_request = WasteRequest.objects.get(id=waste_request_id)
#         except WasteRequest.DoesNotExist:
#             return Response({"detail": "WasteRequest not found"}, status=404)

#         # Get or create status object
#         obj, created = WasteRequestStatus.objects.get_or_create(
#             waste_request=waste_request,
#             pickup_date=pickup_date,
#             defaults={"status": "Cancelled", "updated_by": request.user}
#         )

#         if not created:
#             if obj.status == "Cancelled":
#                 return Response({"detail": "Already cancelled"}, status=400)
#             obj.status = "Cancelled"
#             obj.updated_by = request.user
#             obj.save()

#             # Create cancelled record
#         cancelled_obj, _ = WasteRequestCancelled.objects.get_or_create(
#             waste_request=waste_request,
#             pickup_date=pickup_date,
#             defaults={
#                 "final_amount": waste_request.final_amount,
#                 "cancelled_by": "User"
#             }
#         )
#         today = timezone.now().date()
#         refund_data = {}

#         # Process refund for online payments
#         if payment_method != "Cash on Pickup" and (transaction_id or waste_request.transaction_id):
#             refund_transaction_id = transaction_id or waste_request.transaction_id              

#             refund_amount = cancelled_obj.final_amount
#             refund_result = initiate_razorpay_refund(
#                 transaction_id=refund_transaction_id,
#                 amount=refund_amount
#             )
            
#             if refund_result.get("success"):
#                 cancelled_obj.refund_id = refund_result.get("refund_id")
#                 cancelled_obj.refund_status = refund_result.get("status")
#                 cancelled_obj.refund_amount = refund_result.get("amount")
#                 cancelled_obj.save()
                
#                 refund_data = {
#                     "refund_id": cancelled_obj.refund_id,
#                     "refund_status": cancelled_obj.refund_status,
#                     "refund_amount": cancelled_obj.refund_amount
#                 }
#             else:
#                 cancelled_obj.refund_status = "failed"
#                 cancelled_obj.refund_error = refund_result.get("error")
#                 cancelled_obj.save()
                
#                 refund_data = {
#                     "refund_status": "failed",
#                     "refund_error": refund_result.get("error")
#                 }

#         # Prepare response
#         response_data = {
#             "message": "Pickup cancelled successfully",
#             "pickup_date": pickup_date,
#             "status": "Cancelled",
#             "refund_info": refund_data
#         }

#         # Add refund details to top level for easier access
#         if refund_data.get("refund_id"):
#             response_data.update({
#                 "refund_id": refund_data["refund_id"],
#                 "refund_status": refund_data["refund_status"], 
#                 "refund_amount": refund_data["refund_amount"]
#             })

#         serializer = self.get_serializer(obj)
#         return Response(response_data, status=200)
      


class CancelWasteRequestStatusView(generics.UpdateAPIView):
    """
    Enhanced cancellation view with proper per-pickup refund handling
    PUT /api/user-cancel-request/<waste_request_id>/
    Body: { "pickup_date": "YYYY-MM-DD", "payment_method": "UPI", "transaction_id": "pay_xyz" }
    """
    queryset = WasteRequestStatus.objects.all()
    serializer_class = WasteRequestStatusSerializer
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, *args, **kwargs):
        waste_request_id = self.kwargs.get("waste_request_id")
        pickup_date = request.data.get("pickup_date")
        payment_method = request.data.get("payment_method")
        transaction_id = request.data.get("transaction_id")
        per_pickup_amount = request.data.get("per_pickup_amount")

        if not pickup_date:
            return Response({"detail": "pickup_date is required"}, status=400)

        try:
            waste_request = WasteRequest.objects.get(id=waste_request_id)
        except WasteRequest.DoesNotExist:
            return Response({"detail": "WasteRequest not found"}, status=404)

        # Use provided payment method or fallback to waste_request
        payment_method = payment_method or waste_request.payment_method
        transaction_id = transaction_id or waste_request.transaction_id

        # Parse pickup date
        if isinstance(pickup_date, str):
            pickup_date_obj = datetime.datetime.strptime(pickup_date, "%Y-%m-%d").date()
        else:
            pickup_date_obj = pickup_date

        # Check if pickup can be cancelled
        existing_status = WasteRequestStatus.objects.filter(
            waste_request=waste_request,
            pickup_date=pickup_date_obj
        ).first()
        
        current_status = existing_status.status if existing_status else "Pending"
        if current_status not in ["Assigned", "Pending"]:
            return Response(
                {"detail": f"Cannot cancel pickup with status: {current_status}"}, 
                status=400
            )

        # Calculate per-pickup refund amount
        if per_pickup_amount is None or per_pickup_amount <= 0:
            # Calculate based on total amount divided by pickup dates
            total_pickups = len(waste_request.pickup_dates or [])
            per_pickup_amount = waste_request.final_amount / max(total_pickups, 1)

        # Get or create status object and set to Cancelled
        obj, created = WasteRequestStatus.objects.get_or_create(
            waste_request=waste_request,
            pickup_date=pickup_date_obj,
            defaults={"status": "Cancelled", "updated_by": request.user}
        )

        if not created:
            if obj.status == "Cancelled":
                return Response({"detail": "Already cancelled"}, status=400)
            obj.status = "Cancelled"
            obj.updated_by = request.user
            obj.save()

        # Create cancelled record with proper amount
        cancelled_obj, _ = WasteRequestCancelled.objects.get_or_create(
            waste_request=waste_request,
            pickup_date=pickup_date_obj,
            defaults={
                "final_amount": per_pickup_amount,  # Use per-pickup amount
                "cancelled_by": "User",
                "refund_status": "Refund Initiated" 
            }
        )

        # Update cancelled object amount if it was created earlier with wrong amount
        if cancelled_obj.final_amount != per_pickup_amount:
            cancelled_obj.final_amount = per_pickup_amount
            cancelled_obj.save()

        refund_data = {}
        response_data = {
            "message": "Pickup cancelled successfully",
            "pickup_date": pickup_date,
            "cancelled_amount": per_pickup_amount,
            "status": "Cancelled"
        }

        # Process refund for online payments
        if payment_method not in ["Cash on Pickup"] and transaction_id:
            refund_result = initiate_razorpay_refund(
                transaction_id=transaction_id,
                old_amount=per_pickup_amount,  # Use per-pickup amount for refund
                reason="cancel"
            )
            
            if refund_result.get("success"):
                # Update cancelled object with refund details
                cancelled_obj.refund_id = refund_result.get("refund_id")
                cancelled_obj.refund_status = "Refund Initiated"
                cancelled_obj.refund_amount = refund_result.get("amount", per_pickup_amount)
                cancelled_obj.save()
                
                refund_data = {
                    "refund_id": cancelled_obj.refund_id,
                    "refund_status": cancelled_obj.refund_status,
                    "refund_amount": cancelled_obj.refund_amount
                }
                
                # Add to top level response for easier frontend access
                response_data.update({
                    "refund_id": cancelled_obj.refund_id,
                    "refund_status": cancelled_obj.refund_status,
                    "refund_amount": cancelled_obj.refund_amount
                })
                
                logger.info(f"Refund initiated for cancellation: {cancelled_obj.refund_id}")
                
            else:
                # Handle refund failure
                cancelled_obj.refund_status = "failed"
                cancelled_obj.refund_error = refund_result.get("error", "Unknown error")
                cancelled_obj.save()
                
                refund_data = {
                    "refund_status": "failed",
                    "refund_error": refund_result.get("error")
                }
                
                response_data["refund_error"] = refund_result.get("error")
                logger.error(f"Refund failed for cancellation: {refund_result.get('error')}")

        response_data["refund_info"] = refund_data
        
        return Response(response_data, status=200)
  



class FeedbackAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, waste_request_id):
        try:
            waste_request = WasteRequest.objects.get(id=waste_request_id)
        except WasteRequest.DoesNotExist:
            return Response({"detail": "WasteRequest not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = FeedbackSerializer(data=request.data)
        if serializer.is_valid():
            pickup_date = serializer.validated_data['pickup_date']
            feedback, created = Feedback.objects.update_or_create(
                waste_request=waste_request,
                pickup_date=pickup_date,
                defaults={
                    'user': request.user,
                    'comment': serializer.validated_data['comment'],
                    'rating': serializer.validated_data['rating'],
                }
            )
            return Response(FeedbackSerializer(feedback).data, status=status.HTTP_200_OK)
            # serializer.save(waste_request=waste_request, user=request.user)
        
            # return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)





class UserDashboardAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        qs = WasteRequest.objects.filter(user=user)
        current_year = timezone.now().year

        # 1. Quick Stats
        total_requests = sum(
            (len(req.pickup_dates or []) - req.cancelled_pickups.count())
            for req in qs
        )
        
        # Count Pending/Assigned statuses in table
        db_active = WasteRequestStatus.objects.filter(
            waste_request__user=user,
            status__in=["Assigned", "Pending","on the way"]
        ).count()

        # For missing status calculation - you may need to adjust this logic
        # This is a placeholder - implement based on your specific requirements
        missing_status_count = 0  # Implement your logic here

        active_requests = db_active + missing_status_count

        completed_pickups = WasteRequestStatus.objects.filter(
            waste_request__user=user,
            status="Complete"
        ).count()

        # Calculate pending payments
        pending_count = 0
        pending_payments_list = []

        for req in qs:
            if req.payment_method == "Cash on Pickup":
                for d in (req.pickup_dates or []):
                    paid = WasteRequestStatus.objects.filter(
                        waste_request=req, pickup_date=d, status="Paid"
                    ).exists()
                    if not paid:
                        pickup_date_obj = date.fromisoformat(d) if isinstance(d, str) else d
                        pending_count += 1
                        pending_payments_list.append({
                            "id": req.id,
                            "description": f"{req.waste_type} - {req.address[:20]}",
                            # "amount": float(req.final_amount / max(len(req.pickup_dates or []), 1)),
                            "amount": round(float(req.final_amount / max(len(req.pickup_dates or []), 1)), 2),
                            "date": pickup_date_obj.strftime("%Y-%m-%d"),
                        })
            else:
                if req.payment_status == "Pending":
                    pending_count += 1
                    pending_payments_list.append({
                        "id": req.id,
                        "description": f"{req.waste_type} - {req.address[:20]}",
                        
                        "amount": round(float(req.final_amount) if req.final_amount else 0, 2),
                        # "amount": float(req.final_amount) if req.final_amount else 0,
                        "date": req.created_at.strftime("%Y-%m-%d") if req.created_at else None,
                    })

        # Set pending_payments to the calculated count
        pending_payments = pending_count

        # 3. Upcoming Schedule (nearest future pickup)
        upcoming = WasteRequestStatus.objects.filter(
            waste_request__user=user,
            pickup_date__gte=date.today()
        ).order_by("pickup_date").first()

        upcoming_schedule = None
        if upcoming:
            upcoming_schedule = {
                "date": upcoming.pickup_date.strftime("%B %d, %Y"),
                "time": "9:00 AM - 5:00 PM",
                "location": upcoming.waste_request.address,
                "type": upcoming.waste_request.waste_type,
            }

        # 4. Monthly Pickup Trend
        monthly_data = (
            WasteRequestStatus.objects.filter(
                waste_request__user=user, 
                status="Complete",
                pickup_date__year=current_year
            )
            .extra(select={"month": "strftime('%%m', pickup_date)"})
            .values("month")
            .annotate(total=Count("id"))
        )

        monthly_dict = {m["month"]: m["total"] for m in monthly_data}
        all_months = [f"{i:02d}" for i in range(1, 13)]
        monthly_trend = [
            {"month": month, "pickups": monthly_dict.get(month, 0)}
            for month in all_months
        ]

        # 5. Notifications
        notifications = []
        
        # Get recent completed pickups
        recent_completed = WasteRequestStatus.objects.filter(
            waste_request__user=user,
            status="Complete"
        ).select_related('waste_request').order_by('-updated_at')[:2]
        
        for status in recent_completed:
            time_diff = timezone.now() - status.updated_at
            if time_diff.days == 0:
                time_str = f"{time_diff.seconds // 3600} hours ago" if time_diff.seconds >= 3600 else f"{time_diff.seconds // 60} minutes ago"
            else:
                time_str = f"{time_diff.days} day{'s' if time_diff.days > 1 else ''} ago"
                
            notifications.append({
                "id": len(notifications) + 1,
                "type": "success",
                "message": f"Your {status.waste_request.waste_type} pickup has been completed successfully",
                "time": time_str
            })

        # Get upcoming scheduled pickups
        upcoming_pickups = WasteRequestStatus.objects.filter(
            waste_request__user=user,
            status__in=["Assigned", "Pending"],
            pickup_date__gte=date.today()
        ).select_related('waste_request').order_by('pickup_date')[:2]
        
        for pickup in upcoming_pickups:
            days_until = (pickup.pickup_date - date.today()).days
            if days_until == 0:
                time_str = "Today"
            elif days_until == 1:
                time_str = "Tomorrow"
            else:
                time_str = f"In {days_until} days"
                
            notifications.append({
                "id": len(notifications) + 1,
                "type": "info",
                "message": f"Pickup scheduled for {pickup.waste_request.waste_type} - {pickup.pickup_date.strftime('%B %d')}",
                "time": time_str
            })

        # Get pending payments notifications
        if pending_payments > 0:
            notifications.append({
                "id": len(notifications) + 1,
                "type": "warning",
                "message": f"You have {pending_payments} pending payment{'s' if pending_payments > 1 else ''}",
                "time": "Requires attention"
            })

        # Get active requests being processed
        active_processing = WasteRequestStatus.objects.filter(
            waste_request__user=user,
            status="Assigned"
        ).select_related('waste_request').order_by('-updated_at')[:1]
        
        for status in active_processing:
            notifications.append({
                "id": len(notifications) + 1,
                "type": "info",
                "message": f"Driver assigned for your {status.waste_request.waste_type} pickup",
                "time": "Active"
            })

        # Sort notifications by priority
        priority_order = {"warning": 1, "info": 2, "success": 3}
        notifications.sort(key=lambda x: priority_order.get(x["type"], 4))
        notifications = notifications[:5]

        # Final Response
        return Response({
            "quickStats": {
                "totalRequests": total_requests,
                "activeRequests": active_requests,
                "completedPickups": completed_pickups,
                "pendingPayments": pending_payments,
            },
            "user": {
                "name": qs.first().name if qs.exists() else (user.get_full_name() or user.username),
                "email": user.email
            },
            "pendingPayments": pending_payments_list,
            "upcomingSchedule": upcoming_schedule,
            "monthlyData": monthly_trend,
            "notifications": notifications,
        })


# class FeedbackAPIView(APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request, pk):
#         pickup_date = request.data.get("pickup_date")
#         if not pickup_date:
#             return Response({"error": "pickup_date is required"}, status=status.HTTP_400_BAD_REQUEST)

#         try:
#             waste_request = WasteRequest.objects.get(pk=pk, user=request.user)
#         except WasteRequest.DoesNotExist:
#             return Response({"error": "Request not found"}, status=status.HTTP_404_NOT_FOUND)

#         # ✅ Check if that date exists in this request
#         if pickup_date not in [str(d) for d in (waste_request.pickup_dates or [])]:
#             return Response({"error": "Invalid pickup_date for this request"}, status=status.HTTP_400_BAD_REQUEST)

#         # ✅ Only allow feedback if status = Complete for that date
#         status_obj = waste_request.statuses.filter(pickup_date=pickup_date).first()
#         if not status_obj or status_obj.status != "Complete":
#             return Response(
#                 {"error": "Feedback allowed only after pickup is completed."},
#                 status=status.HTTP_400_BAD_REQUEST,
#             )

#         feedback, created = UserFeedback.objects.update_or_create(
#             waste_request=waste_request,
#             pickup_date=pickup_date,
#             user=request.user,
#             defaults={
#                 "comment": request.data.get("comment", ""),
#                 "rating": request.data.get("rating", 0),
#             },
#         )
#         return Response(UserFeedbackSerializer(feedback).data, status=status.HTTP_200_OK)

        
    
    


class ContactMessageView(APIView):
    # permission_classes = [IsAuthenticatedOrReadOnly]
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        data = request.data.copy()  # copy data from frontend
        if request.user.is_authenticated:
            data['user'] = request.user.id
            data['is_member'] = True
        else:
            data['user'] = None
            data['is_member'] = False
            

        serializer = ContactMessageSerializer(data=data)
        if serializer.is_valid():
            serializer.save(user=request.user if request.user.is_authenticated else None,
                    is_member=request.user.is_authenticated)
            return Response({"message": "Message sent successfully!"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all().order_by("-created_at")
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]

    
class InvoiceUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        waste_request_id = request.data.get("waste_request_id")
        file = request.FILES.get("file")

        if not waste_request_id or not file:
            return Response({"error": "Missing fields"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            waste_request = WasteRequest.objects.get(id=waste_request_id, user=request.user)
        except WasteRequest.DoesNotExist:
            return Response({"error": "Request not found"}, status=status.HTTP_404_NOT_FOUND)

        invoice = Invoice.objects.create(
            related_request=waste_request,
            invoice_file=file
        )

        return Response({"message": "Invoice uploaded", "invoice_id": invoice.id}, status=status.HTTP_201_CREATED)






class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)

    def put(self, request):
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# class UserProfileView(generics.RetrieveUpdateAPIView):
#     serializer_class = UserProfileSerializer
#     permission_classes = [permissions.IsAuthenticated]

#     def get_object(self):
#         return UserProfile.objects.get(user=self.request.user)



class NotificationViewSet(viewsets.ModelViewSet):
    queryset=Notification.objects.all()
    serializer_class=NotificationSerializer

class PaymentViewSet(viewsets.ModelViewSet):
    queryset=Payment.objects.all()
    serializer_class=PaymentSerializer

class RefundViewSet(viewsets.ModelViewSet):
    queryset=Refund.objects.all()
    serializer_class=RefundSerializer



