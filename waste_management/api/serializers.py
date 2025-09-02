from rest_framework import serializers
from datetime import timedelta
import datetime
# from dateutil.relativedelta import relativedelta
from .models import WasteRequest, Notification, Payment, Refund, CollectionDetail, RequestUpdate, WasteCategory, StaffProfile, City, PickupDate, UserProfile, WasteRequestStatus, Invoice, WasteRequestPickup,WasteRequestUserUpdate,Feedback,ContactMessage
from django.contrib.auth.models import User
from decimal import Decimal, ROUND_HALF_UP


class RegisterSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(write_only=True)
    phone_number = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})
    password2 = serializers.CharField(write_only=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2' ,'full_name', 'phone_number']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password2":"Passwords do not match."})
        if not attrs['phone_number'].isdigit() or len(attrs['phone_number'])!=10:
            raise serializers.ValidationError({"phone_number":"phone number must be exact 10 digits"})
        return attrs

    def create(self, validated_data):
        
        full_name = validated_data.pop('full_name')
        phone_number = validated_data.pop('phone_number')
        validated_data.pop('password2')
        validated_data['username']=full_name
        user = User.objects.create_user(**validated_data)
        UserProfile.objects.create(user=user, full_name=full_name, phone_number=phone_number)
        return user

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
        fields = '__all__'
        read_only_fields = ['user', 'is_member', 'created_at']

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
            'id', 'user', 'name', 'email', 'phone', 'address', 'city',
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
            "economy_weight_option",
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



# class NearestPickupSerializer(serializers.ModelSerializer):
#     nearest_pickup_date = serializers.SerializerMethodField()

#     class Meta:
#         model = WasteRequest
#         fields = ["order_id", "status", "nearest_pickup_date"]

#     def get_nearest_pickup_date(self, obj):
#         """Return the soonest valid pickup date from pickup_dates JSONField."""
#         if not obj.pickup_dates:
#             return None
#         today = datetime.date.today()
#         valid_dates = [
#             datetime.datetime.strptime(d, "%Y-%m-%d").date()
#             for d in obj.pickup_dates
#             if d
#         ]
#         future_dates = [d for d in valid_dates if d >= today]
#         if future_dates:
#             return min(future_dates).strftime("%Y-%m-%d")
#         return None







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

class CollectionDetailSerializer(serializers.ModelSerializer):
  class Meta:
    model = CollectionDetail
    fields = '__all__'

class RequestUpdateSerializer(serializers.ModelSerializer):
  class Meta:
    model = RequestUpdate
    fields = '__all__'

class WasteCategorySerializer(serializers.ModelSerializer):
  class Meta:
    model = WasteCategory
    fields = '__all__'

class StaffProfileSerializer(serializers.ModelSerializer):
  class Meta:
    model = StaffProfile
    fields = '__all__'
  
class UserSerializer(serializers.ModelSerializer):
  class Meta:
    model = User
    fields = ['id', 'username', 'email']

  