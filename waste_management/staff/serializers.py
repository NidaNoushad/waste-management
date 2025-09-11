from rest_framework import serializers
from api.models import WasteRequestStatus  # import from your main api app

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