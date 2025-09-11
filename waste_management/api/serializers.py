from rest_framework import serializers
from datetime import timedelta
import datetime
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
# from dateutil.relativedelta import relativedelta
from .models import WasteRequest, Notification, Payment, Refund, City, PickupDate, UserProfile, WasteRequestStatus, Invoice, WasteRequestPickup,WasteRequestUserUpdate,Feedback,ContactMessage,UserProfile
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from decimal import Decimal, ROUND_HALF_UP
from django.core.mail import send_mail
from django.conf import settings
import re
from django.contrib.auth import get_user_model


# class RegisterSerializer(serializers.ModelSerializer):
#     full_name = serializers.CharField(write_only=True)
#     phone_number = serializers.CharField(write_only=True)
#     password = serializers.CharField(write_only=True, style={'input_type': 'password'})
#     password2 = serializers.CharField(write_only=True, style={'input_type': 'password'})

#     class Meta:
#         model = User
#         fields = ['username', 'email', 'password', 'password2' ,'full_name', 'phone_number']
    
#     def validate(self, attrs):
#         if attrs['password'] != attrs['password2']:
#             raise serializers.ValidationError({"password2":"Passwords do not match."})
#         if not attrs['phone_number'].isdigit() or len(attrs['phone_number'])!=10:
#             raise serializers.ValidationError({"phone_number":"phone number must be exact 10 digits"})
#         return attrs

#     def create(self, validated_data):
        
#         full_name = validated_data.pop('full_name')
#         phone_number = validated_data.pop('phone_number')
#         validated_data.pop('password2')
#         validated_data['username']=full_name
#         user = User.objects.create_user(**validated_data)
#         UserProfile.objects.create(user=user, full_name=full_name, phone_number=phone_number)
#         return user

# class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
#     username_field = "email"

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = "email"

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['email'] = user.email
        return token

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("No account found with this email.")

        if not user.check_password(password):
            raise serializers.ValidationError("Invalid password.")

        if user.is_staff:
            raise serializers.ValidationError("Staff cannot login from customer portal.")

        if not user.is_active:
            raise serializers.ValidationError("This account is inactive.")

        data = super().validate({
             "username": user.username,
            "password": password
        })

        data["email"] = user.email
        return data
    

class RegisterSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(write_only=True)
    phone_number = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})
    password2 = serializers.CharField(write_only=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ['email', 'password', 'password2', 'full_name', 'phone_number']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password2": "Passwords do not match."})
        if not attrs['phone_number'].isdigit() or len(attrs['phone_number']) != 10:
            raise serializers.ValidationError({"phone_number": "Phone number must be 10 digits"})
        return attrs

    def create(self, validated_data):
        full_name = validated_data.pop('full_name')
        phone_number = validated_data.pop('phone_number')
        validated_data.pop('password2')

        # use email as username internally
        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            password=validated_data['password']
        )

        UserProfile.objects.create(user=user, full_name=full_name, phone_number=phone_number)
        return user

    def to_representation(self, instance):
        """Customize response to include profile details"""
        representation = super().to_representation(instance)
        representation['full_name'] = instance.profile.full_name
        representation['phone_number'] = instance.profile.phone_number
        return representation



class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        try:
            user = User.objects.get(email=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("No user found with this email address.")
        return value

    def save(self):
        email = self.validated_data['email']
        user = User.objects.get(email=email)
        
        # Generate token and uid
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        
        # Create reset link
        reset_link = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}/"
        
        # Send email
        subject = 'Password Reset Request'
        message = f'''
        Hello {user.username},

        You have requested to reset your password. Please click the link below to reset your password:

        {reset_link}

        If you didn't request this, please ignore this email.

        Best regards,
        Your App Team
        '''
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,
        )
        
        return user

class PasswordResetConfirmSerializer(serializers.Serializer):
    new_password1 = serializers.CharField(write_only=True)
    new_password2 = serializers.CharField(write_only=True)

    def validate_new_password1(self, value):
        # Add password validation rules
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long.")
        
        if not re.search(r"[A-Z]", value):
            raise serializers.ValidationError("Password must contain at least one uppercase letter.")
        
        if not re.search(r"[a-z]", value):
            raise serializers.ValidationError("Password must contain at least one lowercase letter.")
        
        if not re.search(r"\d", value):
            raise serializers.ValidationError("Password must contain at least one digit.")
        
        return value

    def validate(self, attrs):
        if attrs['new_password1'] != attrs['new_password2']:
            raise serializers.ValidationError("The two password fields didn't match.")
        return attrs




class PickupDateSerializer(serializers.ModelSerializer):
  class Meta:
      model=PickupDate
      fields = ['id','city','date']

class CitySerializer(serializers.ModelSerializer):
  pickup_dates=PickupDateSerializer(many=True, read_only=True)
  class Meta:
      model=City
      fields = ['id','name','pickup_dates']

class InvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invoice
        fields = ["id", "related_request", "related_update", "invoice_file", "created_at"]

class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = ["id", "waste_request", "pickup_date", "user", "comment", "rating", "created_at"]
        read_only_fields = ["id", "user", "created_at","waste_request"]

class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields =  ['id', 'user', 'is_member', 'name', 'email', 'phone', 'subject', 'message', 'created_at']
        read_only_fields =  ['id', 'created_at', 'user', 'is_member'] 

class WasteRequestSerializer(serializers.ModelSerializer):
    invoices = InvoiceSerializer(many=True, read_only=True)
    feedbacks = FeedbackSerializer(many=True, read_only=True) 
    latest_status = serializers.SerializerMethodField()
    pickup_dates = serializers.ListField(
        child=serializers.DateField(format="%Y-%m-%d"),
        required=False
    )
    per_date_breakdown = serializers.SerializerMethodField()  
    
    class Meta:
        model = WasteRequest
        fields = [
            # Model fields
            'id', 'user', 'name', 'email', 'phone', 'address', 'city','zipcode',
            'date', 'waste_type', 'category', 'weight', 'frequency', 'urgency',
            'duration', 'status', 'order_id', 'transaction_id', 'payment_method', 'payment_status',
            # Custom / computed fields
             'economy_weight_option',
            'base_price', 'additional_charges', 'gstAmount', 'final_amount',
            'pickup_dates', 'latest_status',
            'per_date_breakdown',"invoices", 'feedbacks'  # 👈 include here
            
        ]
            

    def validate_email(self, value):
        if not value:
            raise serializers.ValidationError("Email is required.")
        return value

    def get_latest_status(self, obj):
        latest = obj.statuses.first()
        return latest.status if latest else "Pending"

    def get_pickup_dates(self, obj):
        if obj.pickup_dates:
            return [datetime.datetime.strptime(d, "%Y-%m-%d").strftime("%d/%m/%Y") for d in obj.pickup_dates]
        return []

    def create(self, validated_data):
        if 'pickup_dates' in validated_data:
            # Convert date objects to strings for JSONField
            validated_data['pickup_dates'] = [str(d) for d in validated_data['pickup_dates']]
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if 'pickup_dates' in validated_data:
            validated_data['pickup_dates'] = [str(d) for d in validated_data['pickup_dates']]
        return super().update(instance, validated_data)

      # --------------------------
    # 🔥 Per-Date Breakdown Logic
    # --------------------------
    # For frontend (showing per-date breakdown, safe with defaults)
    def get_per_date_breakdown(self, obj):
     breakdown = []

    # Cancelled dates
     cancelled_dates = [
        d.strftime("%Y-%m-%d") if hasattr(d, "strftime") else str(d)
        for d in getattr(obj, "cancelled_pickups", obj.cancelled_pickups.none()).values_list('pickup_date', flat=True)
    ]
    #  cancelled_dates = obj.cancelled_pickups.values_list('pickup_date', flat=True) if hasattr(obj, "cancelled_pickups") else []
    #  cancelled_dates = [
    #     (d.strftime("%Y-%m-%d") if hasattr(d, "strftime") else str(d))
    #     for d in cancelled_dates
    # ]

    # Valid pickup dates
     valid_dates = [
        (d if hasattr(d, "strftime") else datetime.datetime.strptime(d, "%Y-%m-%d").date())
        for d in (obj.pickup_dates or [])
        # if (d.strftime("%Y-%m-%d") if hasattr(d, "strftime") else str(d)) not in cancelled_dates
    ]

    # Share calculation
     num_dates_total = len(obj.pickup_dates or [])
     final_amount = Decimal(obj.final_amount or 0)
     original_share = float(obj.final_amount or 0) / num_dates_total if num_dates_total else 0
    

     updates = obj.wasterequestuserupdate_set.all()
     update_dict = {
    str(upd.pickup_date): float(upd.final_amount)
    for upd in updates if upd.is_manual  # only override if manual
}

    #  total_original = 0  # Initialize before the loop
    #  total_updated = 0 
     invoice_total = 0

    # Build breakdown
     for d in valid_dates:
        
       d_str = d.strftime("%Y-%m-%d") if hasattr(d, "strftime") else str(d)
       updated_amount = update_dict.get(d_str, original_share)  # 👈 default to original_share
       difference = updated_amount - original_share
       invoice_total += updated_amount  
       cancelled = d_str in cancelled_dates
    

       breakdown.append({
            "pickup_date": d_str,
            "original_amount":original_share,
            "updated_amount": updated_amount,
            "refund_extra": difference,
            "cancelled": cancelled
        })
     return {
    "breakdown": breakdown,
    "invoice_total": round(invoice_total, 2)  # total based on original + adjustments
}

    #  return breakdown

class WasteRequestStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = WasteRequestStatus
        fields = '__all__'



class WasteRequestPickupSerializer(serializers.ModelSerializer):
    # Include order_id and user details from parent WasteRequest
    order_id = serializers.CharField(source="waste_request.order_id", read_only=True)
    user_name = serializers.CharField(source="waste_request.name", read_only=True)
    user_email = serializers.EmailField(source="waste_request.email", read_only=True)
    user_phone = serializers.CharField(source="waste_request.phone", read_only=True)
    user_address = serializers.CharField(source="waste_request.address", read_only=True)

    class Meta:
        model = WasteRequestPickup
        fields = [
            "id", "order_id", "pickup_date", "waste_type", "weight", "category",
            "base_price", "gstAmount", "final_amount", "status",
            "user_name", "user_email", "user_phone", "user_address",
            "created_at", "updated_at"
        ]
        read_only_fields = ["id", "order_id", "created_at", "updated_at"]

    def validate_weight(self, value):
        if value is not None and value <= 0:
            raise serializers.ValidationError("Weight must be greater than zero.")
        return value

    def update(self, instance, validated_data):
        """
        Custom update logic if needed. 
        (Here you can also auto-calc base_price, gst, final_amount in backend
        instead of frontend, for security reasons.)
        """
        instance.waste_type = validated_data.get("waste_type", instance.waste_type)
        instance.weight = validated_data.get("weight", instance.weight)
        instance.category = validated_data.get("category", instance.category)
        instance.base_price = validated_data.get("base_price", instance.base_price)
        instance.gstAmount = validated_data.get("gstAmount", instance.gstAmount)
        instance.final_amount = validated_data.get("final_amount", instance.final_amount)
        instance.status = validated_data.get("status", instance.status)
        instance.save()
        return instance

class WasteRequestUserUpdateSerializer(serializers.ModelSerializer):
  
    economyWeightOption = serializers.CharField(source="economy_weight_option", required=False, allow_null=True)
    class Meta:
        model = WasteRequestUserUpdate
        fields = [
            "id",
            "waste_request",
            "pickup_date",
            "waste_type",
            "weight",
            'economyWeightOption',
            # "economy_weight_option",
            "category",
            "address",
            "email",
            "base_price",
            # "gst_amount",
            "gstAmount",
            "final_amount",
            "updated_by",
            "updated_at",
        ]
        read_only_fields = ["id", "updated_by", "updated_at"]


class UserProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email", required=False)
    full_name = serializers.CharField(required=False) 
    # full_name = serializers.CharField(source="user.first_name", required=False)
  

    class Meta:
        model = UserProfile
        fields = ["full_name", "email", "phone_number", "address", "city", "zipcode",  "email_notifications", "sms_notifications"]

    # def get_full_name(self, obj):
    #      return f"{obj.user.first_name} {obj.user.last_name}".strip()

    def update(self, instance, validated_data):
        # update user fields
        user_data = validated_data.pop("user", {})
        user = instance.user
       # update email
        if "email" in user_data:
            user.email = user_data["email"]


        if "first_name" in user_data:
            user.first_name = user_data["first_name"]

        # update full_name (split into first/last)
        # full_name = self.context["request"].data.get("full_name")
        # if full_name:
        #     parts = full_name.strip().split(" ", 1)
        #     user.first_name = parts[0]
        #     user.last_name = parts[1] if len(parts) > 1 else ""

        user.save()

        # update profile fields
        # instance.phone_number = validated_data.get("phone", instance.phone_number)
        # instance.address = validated_data.get("address", instance.address)
        # instance.city = validated_data.get("city", instance.city)
        # instance.zip_code = validated_data.get("zip_code", instance.zip_code)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
       
        instance.save()

        return instance

# class UserProfileSerializer(serializers.ModelSerializer):
#     email = serializers.EmailField(source="user.email", required=True)

#     class Meta:
#         model = UserProfile
#         fields = ["id", "full_name", "phone_number", "email"]

#     def update(self, instance, validated_data):
#         # Update nested user email
#         user_data = validated_data.pop("user", {})
#         email = user_data.get("email")
#         if email:
#             instance.user.email = email
#             instance.user.save()

#         # Update UserProfile fields
#         return super().update(instance, validated_data)


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    confirm_password = serializers.CharField(required=True)

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError("New passwords do not match")
        return data









class NotificationSerializer(serializers.ModelSerializer):
  class Meta:
    model = Notification
    fields = '__all__'


class PaymentSerializer(serializers.ModelSerializer):
  class Meta:
    model = Payment
    fields = '__all__'

class RefundSerializer(serializers.ModelSerializer):
  class Meta:
    model = Refund
    fields = '__all__'



User = get_user_model()
# class StaffTokenObtainPairSerializer(TokenObtainPairSerializer):
#     username_field = "username"  # staff login by username

#     def validate(self, attrs):
#         username = attrs.get("username")
#         password = attrs.get("password")

#         # find user by username
#         try:
#             user = User.objects.get(username=username)
#         except User.DoesNotExist:
#             raise serializers.ValidationError("No account found with this username.")

#         # only allow staff
#         if not user.is_staff:
#             raise serializers.ValidationError("You are not authorized as staff.")

#         # check password
#         if not user.check_password(password):
#             raise serializers.ValidationError("Invalid password.")

#         if not user.is_active:
#             raise serializers.ValidationError("This account is inactive.")

#         data = super().validate({"username": username, "password": password})
#         data["username"] = user.username
#         return data


class StaffTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = "username"  # login by username

    def validate(self, attrs):
        username = attrs.get(self.username_field)
        password = attrs.get("password")

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            raise serializers.ValidationError("No account found with this username.")

        if not user.is_staff:
            raise serializers.ValidationError("You are not authorized as staff.")

        if not user.check_password(password):
            raise serializers.ValidationError("Invalid password.")

        if not user.is_active:
            raise serializers.ValidationError("This account is inactive.")

        # ✅ call parent with correct attrs
        data = super().validate(attrs)
        data.update({"username": user.username, "email": getattr(user, "email", "")})
        return data