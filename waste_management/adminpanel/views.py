from django.shortcuts import render




# adminpanel/views.py
from django.contrib.auth.models import User
from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.permissions import IsAdminUser
from django.db import models
from django.db.models import Count
from django.utils import timezone
from datetime import timedelta
from rest_framework.pagination import PageNumberPagination
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum, F, FloatField
from rest_framework import generics, permissions, filters,status

from django.utils.timezone import now
from rest_framework.permissions import IsAuthenticated

from api.models import UserProfile,WasteRequest,WasteRequestUserUpdate,WasteRequestCancelled,ContactMessage,City,PickupDate,Area,WasteRequestStatus
from api.serializers import  WasteRequestUserUpdateSerializer,WasteRequestCancelledSerializer,UserProfileSerializer,ContactMessageSerializer,WasteRequestSerializer
from .serializers import AdminUserSerializer,StaffCreateSerializer,StaffAssignAreasSerializer,StaffPerformanceSerializer
from staff.serializers import AreaSerializer
from staff.models import Staff




class CustomPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100

class AdminUserListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        profiles = UserProfile.objects.filter(user__is_staff=False, user__is_superuser=False)
        serializer = AdminUserSerializer(profiles, many=True)
        return Response(serializer.data)

class AdminWasteRequestListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, user_id):
        requests = WasteRequest.objects.filter(user_id=user_id)
        data = [{"id": r.id, "status": r.status, "preferred_date": r.preferred_date} for r in requests]
        return Response(data)

class AdminUserUpdateListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, user_id):
        # paginator = PageNumberPagination()
        # paginator.page_size = 10
        # Get all WasteRequestUserUpdate objects for this user
        updates = WasteRequestUserUpdate.objects.filter(waste_request__user__id=user_id,is_manual=True)
        serializer = WasteRequestUserUpdateSerializer(updates, many=True)
        # return paginator.get_paginated_response(serializer.data)
        return Response(serializer.data)


class AdminUserCancelledListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, user_id):
        cancelled_list = WasteRequestCancelled.objects.filter(waste_request__user__id=user_id)
        serializer = WasteRequestCancelledSerializer(cancelled_list, many=True)
        return Response(serializer.data)

class AdminUserCancelRequestUpdateView(RetrieveUpdateAPIView):

    queryset = WasteRequestCancelled.objects.all()
    serializer_class = WasteRequestCancelledSerializer
    permission_classes = [IsAdminUser]

class AdminUserProfileView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, user_id):
        profile = UserProfile.objects.get(user_id=user_id)
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)

    def put(self, request, user_id):
        profile = UserProfile.objects.get(user_id=user_id)
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)


class MessagePagination(PageNumberPagination):
    page_size = 10  # number of items per page
    page_size_query_param = "page_size"
    max_page_size = 100

class ContactMessageListView(generics.ListAPIView):
    queryset = ContactMessage.objects.all().order_by("-created_at")
    serializer_class = ContactMessageSerializer
    permission_classes = [permissions.IsAdminUser]
    pagination_class = MessagePagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']  # Search by name

class ContactMessageDetailView(generics.DestroyAPIView):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    permission_classes = [permissions.IsAdminUser]





class PickupDateCreateView(APIView):
    permission_classes = [IsAdminUser]  # Only admin can add

    def post(self, request):
        city_id = request.data.get('city')
        dates = request.data.get('dates', [])  # list of date strings

        if not city_id or not dates:
            return Response({"error": "City and dates are required"}, status=400)

        try:
            city = City.objects.get(id=city_id)
        except City.DoesNotExist:
            return Response({"error": "City not found"}, status=404)

        # Create PickupDate objects
        pickup_objs = [PickupDate(city=city, date=d) for d in dates]
        PickupDate.objects.bulk_create(pickup_objs)

        return Response({"message": "Pickup dates added successfully"}, status=201)

class CreateStaffAPIView(APIView):
    permission_classes = [permissions.IsAdminUser]  # Only admin can create staff

    def post(self, request):
        serializer = StaffCreateSerializer(data=request.data)
        if serializer.is_valid():
            staff = serializer.save()
            return Response({
                "id": staff.id,
                "email": staff.user.email,
                "full_name": staff.user.profile.full_name,
                "phone": staff.user.profile.phone_number,
                "areas": [area.name for area in staff.areas.all()]
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AreaListAPIView(generics.ListAPIView):
    queryset = Area.objects.all()
    serializer_class = AreaSerializer
    permission_classes = [permissions.IsAdminUser] 


class StaffAssignAreasAPIView(APIView):
    permission_classes = [IsAdminUser]  # Only admin can assign

    def patch(self, request, staff_id):
        try:
            staff = Staff.objects.get(id=staff_id)
        except Staff.DoesNotExist:
            return Response({"error": "Staff not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = StaffAssignAreasSerializer(instance=staff, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "id": staff.id,
                "full_name": staff.full_name,
                "email": staff.email,
                "phone": staff.phone,
                "areas": [area.name for area in staff.areas.all()]
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DashboardSummaryAPIView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        # Total users (excluding staff/admin)
        total_users = User.objects.filter(is_staff=False).count()

        # Total staff
        total_staff = Staff.objects.count()

        # Waste requests
        # pending_requests = WasteRequest.objects.filter(status="Pending").count()
        pending_requests = WasteRequestStatus.objects.filter(
        status__in=["Pending", "On the Way", "Assigned"]
        ).count()
        completed_requests = WasteRequestStatus.objects.filter(status="Complete").count()
       
        # completed_requests = WasteRequestStatus.objects.filter(status="Complete").count()
        cancelled_requests = WasteRequestStatus.objects.filter(status="Cancelled").count()


      # 1️⃣ Revenue from completed & paid pickups
        completed_paid = WasteRequestStatus.objects.filter(is_paid=True).annotate(
    amount=F('waste_request__final_amount') / models.functions.Length('waste_request__pickup_dates')
).aggregate(total=Sum('amount', output_field=FloatField()))['total'] or 0

# 2️⃣ Subtract full refunds for cancelled pickups
        full_refunds = WasteRequestCancelled.objects.aggregate(
    total=Sum('refund_amount')
)['total'] or 0

# 3️⃣ Adjust for partial refunds / extra charges
        partial_adjustments = WasteRequestUserUpdate.objects.aggregate(
    total=Sum(F('final_amount') + F('partial_refund_amount') - F('partial_refund_amount'), output_field=FloatField())
)['total'] or 0

# Total revenue
        revenue = completed_paid - full_refunds + (partial_adjustments or 0)


         #  Payment method split (Paid only)
        upi_revenue = WasteRequest.objects.filter(payment_method="UPI", payment_status="Paid").aggregate(
            total=Sum("final_amount")
        )["total"] or 0
        card_revenue = WasteRequest.objects.filter(payment_method="Card", payment_status="Paid").aggregate(
            total=Sum("final_amount")
        )["total"] or 0
        cash_revenue = WasteRequest.objects.filter(payment_method="Cash on Pickup", payment_status="Paid").aggregate(
            total=Sum("final_amount")
        )["total"] or 0


        waste_counts = WasteRequestStatus.objects.exclude(status="Cancelled").select_related("waste_request")

        waste_type_data = {"economy": 0, "bulk": 0}

        for status_obj in waste_counts:
            req = status_obj.waste_request

    # Look for a user update for this pickup date
            user_update = WasteRequestUserUpdate.objects.filter(
        waste_request=req,
        pickup_date=status_obj.pickup_date
    ).order_by('-id').first()  # get latest update for this date

    # Use updated waste_type if exists, otherwise original
            wt = (user_update.waste_type if user_update and user_update.waste_type else req.waste_type)
            wt = wt.lower() if wt else "unknown"

            if wt in waste_type_data:
                waste_type_data[wt] += 1





        data = {
            "total_users": total_users,
            "total_staff": total_staff,
            "pending_requests": pending_requests,
            "completed_requests": completed_requests,
            "cancelled_requests": cancelled_requests,
            "revenue": revenue,
            "completed_paid": completed_paid,  # total from completed & paid pickups
            "full_refunds": full_refunds,      # total refunds for cancelled pickups
            "partial_adjustments": partial_adjustments,  # partial refunds / extra charges

    # Payment method split (Paid orders only)
            "payment_method_split": {
        "UPI": upi_revenue,
        "Card": card_revenue,
        "Cash": cash_revenue,
    },
       "waste_type_data": [{"name": k, "count": v} for k, v in waste_type_data.items()],
        #  "waste_type_data": waste_type_data,
        }
        return Response(data)



class AdminPickupAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = now().date()
        qs = WasteRequestStatus.objects.filter(pickup_date=today).exclude(status="Cancelled")

     

        flat_rows = []
        for status_obj in qs.select_related('waste_request', 'assigned_staff'):
            req = status_obj.waste_request
            user_update = WasteRequestUserUpdate.objects.filter(
                waste_request=req, pickup_date=status_obj.pickup_date
            ).first()

            breakdown_data = WasteRequestSerializer(req).data.get("per_date_breakdown", {}).get("breakdown", [])
            breakdown_dict = {item["pickup_date"]: item for item in breakdown_data}
            b_row = breakdown_dict.get(str(status_obj.pickup_date))

            original_amount = float(b_row["original_amount"]) if b_row else 0
            updated_amount = float(b_row["updated_amount"]) if b_row and b_row["updated_amount"] is not None else original_amount
            refund_extra = float(b_row["refund_extra"]) if b_row else 0

            refund_amount = refund_extra if refund_extra < 0 else 0
            extra_amount = refund_extra if refund_extra > 0 else 0

            flat_rows.append({
                "status_id": status_obj.id,
                "waste_request_id": req.id,
                "order_id": req.order_id,
                "pickup_date": status_obj.pickup_date,
                "status": status_obj.status,
                "customer": req.name,
                "address": user_update.address if (user_update and user_update.address) else req.address,
                "category": user_update.category if user_update else req.category,
                "waste_type": user_update.waste_type if user_update else req.waste_type,
                "urgency": req.urgency,
                "payment_method": req.payment_method,
                "per_date_amount": updated_amount,
                "refund_amount": refund_amount,
                "extra_amount": extra_amount,
                "is_paid": status_obj.is_paid,
                # "assigned_staff": status_obj.assigned_staff.username if status_obj.assigned_staff else None,
                "assigned_staff": status_obj.assigned_staff.full_name if status_obj.assigned_staff else "Not Assigned"
             
            })

        # Optional status filter
        status_filter = request.query_params.get("status")
        if status_filter and status_filter != "all":
            flat_rows = [row for row in flat_rows if row['status'] == status_filter]

        # Pagination
        paginator = CustomPagination()
        page = paginator.paginate_queryset(flat_rows, request)
        return paginator.get_paginated_response(page)



class DashboardTrendsAPIView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        range_param = request.query_params.get("range", "week")

        if range_param == "month":
            start_date = timezone.now().date() - timedelta(days=30)
        else:  # default = week
            start_date = timezone.now().date() - timedelta(days=7)


        qs = (
    WasteRequestStatus.objects.filter(pickup_date__gte=start_date)
    .values("pickup_date", "status")
    .annotate(count=Count("id"))
    .order_by("pickup_date")
)

        # Build response per day
        data = {}
        for row in qs:
            day = str(row["pickup_date"])
            if day not in data:
                data[day] = {
                    "period": day,
                    "requests": 0,
                    "completed": 0,
                    "cancelled": 0,
                    "pending": 0,
                }
            data[day]["requests"] += row["count"]
            if row["status"] == "Complete":
                data[day]["completed"] += row["count"]
            elif row["status"] == "Cancelled":
                data[day]["cancelled"] += row["count"]
            else:  # Pending, Assigned, On the Way
                data[day]["pending"] += row["count"]

        return Response(list(data.values()))


class StaffPerformanceAPIView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        data = []
        staff_qs = Staff.objects.all()
        
        for staff in staff_qs:
            qs = WasteRequestStatus.objects.filter(assigned_staff=staff)
            total_pickups = qs.count()
            completed = qs.filter(status="Complete").count()
            assigned = qs.filter(status="Assigned").count()
            on_the_way = qs.filter(status="On the Way").count()
            cancelled = qs.filter(status="Cancelled").count()
            
            cod_to_collect = sum(
                (s.waste_request.final_amount or 0) / max(len(s.waste_request.pickup_dates or []), 1)
                for s in qs if s.waste_request.payment_method == "Cash on Pickup"
            )
            collected = sum(
                (s.waste_request.final_amount or 0) / max(len(s.waste_request.pickup_dates or []), 1)
                for s in qs if s.is_paid
            )
            
            data.append({
                "full_name": staff.full_name,
                "email": staff.email,
                "phone": staff.phone,
                "total_pickups": total_pickups,
                "completed": completed,
                "assigned": assigned,
                "on_the_way": on_the_way,
                "cancelled": cancelled,
                "cod_to_collect": cod_to_collect,
                "collected": collected,
            })
        
        serializer = StaffPerformanceSerializer(data, many=True)
        return Response(serializer.data)