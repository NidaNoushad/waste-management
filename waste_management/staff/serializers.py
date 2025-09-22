from rest_framework import serializers
from api.models import WasteRequestStatus  # import from your main api app
from .models import Staff,Area

class StaffTaskSerializer(serializers.ModelSerializer):
    orderId = serializers.CharField(source="waste_request.order_id", read_only=True)
    customer = serializers.CharField(source="waste_request.name", read_only=True)
    address = serializers.CharField(source="waste_request.address", read_only=True)
    # date = serializers.DateField(source="waste_request.date", read_only=True)
    pickupDates = serializers.JSONField(source="waste_request.pickup_dates", read_only=True)
    category = serializers.CharField(source="waste_request.category", read_only=True)
    wasteType = serializers.CharField(source="waste_request.waste_type", read_only=True)
    urgency = serializers.CharField(source="waste_request.urgency", read_only=True)
    paymentMethod = serializers.CharField(source="waste_request.payment_method", read_only=True)
    amount = serializers.DecimalField(source="waste_request.final_amount", max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = WasteRequestStatus
        fields = ["id", "orderId", "customer",   "is_paid", "address", "pickupDates", "status",
                  "category", "wasteType", "urgency", "paymentMethod", "amount"]


class AreaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Area
        fields = ['id', 'name']

class StaffSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    full_name = serializers.CharField(source="user.profile.full_name", read_only=True)
    email = serializers.CharField(source="user.email", read_only=True)
    phone = serializers.CharField(source="user.profile.phone_number", read_only=True)
    areas = AreaSerializer(many=True, read_only=True)  # serialize the ManyToMany field

    class Meta:
        model = Staff
        fields = ['id', 'username', 'full_name', 'email', 'phone', 'areas']
