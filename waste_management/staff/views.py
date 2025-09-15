from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.pagination import PageNumberPagination
from django.db.models import Count, Q
from decimal import  ROUND_HALF_UP, InvalidOperation
from decimal import Decimal
import razorpay
from django.utils import timezone
from api.views import initiate_razorpay_refund
from django.conf import settings
from collections import defaultdict
from datetime import timedelta
from rest_framework.views import APIView
from datetime import datetime
from django.utils.timezone import now
from django.db.models import Sum
import logging
from django.db import transaction
from rest_framework import status as drf_status


from api.models import WasteRequest, WasteRequestStatus,WasteRequestUserUpdate
from api.serializers import WasteRequestSerializer
from .serializers import StaffTaskSerializer
from .permissions import IsStaffUser




class CustomPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


logger = logging.getLogger(__name__)



class StaffPickupViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated, IsStaffUser]
    pagination_class = CustomPagination

    def list(self, request):
        user = request.user
        qs = WasteRequest.objects.all().order_by("-created_at")

    # staff sees only pickups assigned to them
        if hasattr(user, "staff"):
            qs = qs.filter(statuses__assigned_staff=user.staff).distinct()
        elif not user.is_staff:
            return Response([], status=403)

        flat_rows = []

        for req in qs:
        # build breakdown dict once per request
            breakdown_data = WasteRequestSerializer(req).data.get("per_date_breakdown", {}).get("breakdown", [])
            breakdown_dict = {item["pickup_date"]: item for item in breakdown_data}

            for d in (req.pickup_dates or []):
            # check if this date is assigned to current staff
                status_obj = WasteRequestStatus.objects.filter(
                    waste_request=req, pickup_date=d, assigned_staff=user.staff
                ).first()

                if not status_obj:
                    continue  # skip pickups not assigned to this staff

            # ✅ Check for user update
                user_update = WasteRequestUserUpdate.objects.filter(
                    waste_request=req, pickup_date=d
                ).first()

            # Get breakdown info for this date
                b_row = breakdown_dict.get(str(d))

                original_amount = float(b_row["original_amount"]) if b_row else 0
                updated_amount = float(b_row["updated_amount"]) if b_row and b_row["updated_amount"] is not None else original_amount
                refund_extra = float(b_row["refund_extra"]) if b_row else 0

            # Calculate refund vs extra
                refund_amount = refund_extra if refund_extra < 0 else 0
                extra_amount = refund_extra if refund_extra > 0 else 0

                flat_rows.append({
                "status_id": status_obj.id,   # unique row ID for updates
                "waste_request_id": req.id,
                "order_id": req.order_id,
                "pickup_date": d,
                "status": status_obj.status,
                "customer": req.name,
                "address": user_update.address if (user_update and user_update.address) else req.address,
                "category": user_update.category if user_update else req.category,
                "waste_type": user_update.waste_type if user_update else req.waste_type,
                "urgency": req.urgency,
                "payment_method": req.payment_method,
                "per_date_amount": updated_amount,  #  show updated
                "refund_amount": refund_amount,      #  show refund
                "extra_amount": extra_amount,        #  show extra
                "is_paid": status_obj.is_paid,
                })

    # optional filter by status
        status_filter = request.query_params.get("status")
        if status_filter and status_filter != "all":
            flat_rows = [row for row in flat_rows if row['status'] == status_filter]

        paginator = self.pagination_class()
        page = paginator.paginate_queryset(flat_rows, request)
        return paginator.get_paginated_response(page)


    

    @action(detail=True, methods=["put"], url_path="update-status")
    def update_status(self, request, pk=None):
        """Update the status of a specific pickup (by status_id)."""
        try:
            status_obj = WasteRequestStatus.objects.get(
                id=pk, assigned_staff=request.user.staff
            )
        except WasteRequestStatus.DoesNotExist:
            return Response({"error": "Pickup not found"}, status=404)

        new_status = request.data.get("status")
        if new_status not in ["Pending", "Assigned", "On the Way", "Complete", "Cancelled"]:
            return Response({"error": "Invalid status"}, status=400)
    #   update status
        status_obj.status = new_status
        status_obj.save()

        #Get the parent WasteRequest
        # waste_request = status_obj.waste_request



        #  Trigger refund if Complete
        if new_status == "Complete":
            self.handle_partial_refund(status_obj)

        return Response({"success": f"Pickup {pk} updated to {new_status}"}, status=200)

        # staff/views.py
    @action(detail=True, methods=["put"], url_path="confirm-payment")
    def confirm_payment(self, request, pk=None):

        try:
            status_obj = WasteRequestStatus.objects.get(
            id=pk, assigned_staff=request.user.staff
            )
        except WasteRequestStatus.DoesNotExist:
            return Response({"error": "Pickup not found"}, status=404)

        if status_obj.waste_request.payment_method != "Cash on Pickup":
            return Response({"error": "Only cash pickups can be marked paid"}, status=400)

        status_obj.is_paid = True
        status_obj.save()

        return Response({"success": f"Payment for pickup {status_obj.pickup_date} marked as Paid"}, status=200)


        
    @action(detail=False, methods=["get"], url_path="dashboard")
    def dashboard(self, request):
        today = now().date()
         

        # All pickups scheduled for today
        # qs = WasteRequestStatus.objects.filter(pickup_date=today)
        qs = WasteRequestStatus.objects.filter(
                pickup_date=today
            ).exclude(status="Cancelled")


        # If logged-in user is staff, filter by their assignments
        if hasattr(request.user, "staff"):
            staff = request.user.staff
            qs = qs.filter(assigned_staff=request.user.staff)
        else:
            staff = None

        # --- Counts ---
        total_pickups = qs.count()
        pending = qs.filter(status="Pending").count()
        on_the_way = qs.filter(status="On the Way").count()
        completed = qs.filter(status="Complete").count()
        cancelled = qs.filter(status="Cancelled").count()
        assigned = qs.filter(status="Assigned").count()

        # --- COD amounts ---
        # per-pickup amount = final_amount / total_pickups_in_request
        cod_to_collect = 0
        collected = 0
        for s in qs:
            req = s.waste_request
            total_dates = len(req.pickup_dates or [])
            per_date_amount = (req.final_amount or 0) / max(total_dates, 1)

            if req.payment_method == "Cash on Pickup":
                cod_to_collect += per_date_amount
                if s.is_paid:  # collected only if marked paid
                    collected += per_date_amount

        # --- Notifications ---
        new_pickups = qs.filter(status="Pending").count()  # today pending = new
        urgent_pickups = qs.filter(waste_request__urgency="Urgent")
        delayed_pickups = qs.filter(status="On the Way", pickup_date__lt=today)
        upcoming_pickups = qs.filter(status="Assigned")

        return Response({
             "staff_name": staff.full_name if staff else getattr(request.user.profile, "full_name", request.user.username),
            "total_pickups": total_pickups,
            "pending":pending,
            "assigned": assigned,
            "on_the_way": on_the_way,
            "completed": completed,
            "cod_to_collect": round(cod_to_collect, 2),
            "collected": round(collected, 2),
            "new_pickups": new_pickups,
            "cancelled_today": cancelled,
            "urgent_pickups": [
                {"order_id": s.waste_request.order_id, "pickup_date": s.pickup_date}
                for s in urgent_pickups
            ],
            "delayed_pickups": [
                {"order_id": s.waste_request.order_id, "pickup_date": s.pickup_date}
                for s in delayed_pickups
            ],
            "upcoming_pickups": [
                {"order_id": s.waste_request.order_id, "pickup_date": s.pickup_date}
                for s in upcoming_pickups
            ],
        })


    @action(detail=False, methods=["get"], url_path="profile-sidebar")
    def profile_sidebar(self, request):
        """Return profile, working hours, stats, and location for sidebar UI."""
        if not hasattr(request.user, "staff"):
            return Response({"error": "Not a staff user"}, status=403)

        staff = request.user.staff
        today = datetime.today().weekday() 

        # Example: you might store working hours in Staff model
        work_start = getattr(staff, "work_start", "09:00 am")
        work_end = getattr(staff, "work_end", "06:00 pm")
        
# Override for Saturday
        if today == 5:  # Saturday
            work_start = "10:00 am"
            work_end = "05:00 pm"


        # Monthly stats
        today = now().date()
        month_start = today.replace(day=1)
        qs = WasteRequestStatus.objects.filter(
            assigned_staff=staff,
            pickup_date__gte=month_start,
            pickup_date__lte=today
        ).exclude(status="Cancelled")

        total_tasks = qs.count()
        complete = qs.filter(status="Complete").count()
        hours = complete * 1  # example: 1 hr per task (adjust as needed)
        MONTHLY_TASK_TARGET = 50
        MONTHLY_HOURS_TARGET = 160  

        return Response({
            "staff_name": staff.full_name,
            "role": "Staff Member",
            "work_start": work_start,
            "work_end": work_end,
            "stats": {
                "tasks": total_tasks,
                "complete": complete,
                "hours": hours,
                "progress": {
                     "tasks_percent": (total_tasks / MONTHLY_TASK_TARGET * 100) if MONTHLY_TASK_TARGET else 0,
           "completed_percent": (complete / MONTHLY_TASK_TARGET * 100) if MONTHLY_TASK_TARGET else 0,
    "hours_percent": (hours / MONTHLY_HOURS_TARGET * 100) if MONTHLY_HOURS_TARGET else 0,
        }
            },
            "location": {
                "city": getattr(staff, "city", "Kerala"),
                "timezone": "GMT+7"
            }
        })

    @action(detail=False, methods=["get"], url_path="overall-dashboard")
    def overall_dashboard(self, request):
        if not hasattr(request.user, "staff"):
            return Response({"error": "Not a staff user"}, status=403)

        staff = request.user.staff

        # --- All-time pickups assigned to this staff ---
        qs = WasteRequestStatus.objects.filter(assigned_staff=staff)

        # --- Counts ---
        total_pickups = qs.count()
        completed = qs.filter(status="Complete").count()
        assigned = qs.filter(status="Assigned").count()
        pending = qs.filter(status="Pending").count()
        on_the_way = qs.filter(status="On the Way").count()
        cancelled = qs.filter(status="Cancelled").count()

        # --- COD amounts ---
        cod_to_collect = 0
        collected = 0
        for s in qs:
            req = s.waste_request
            total_dates = len(req.pickup_dates or [])
            per_date_amount = (req.final_amount or 0) / max(total_dates, 1)

            if req.payment_method == "Cash on Pickup":
                cod_to_collect += per_date_amount
                if s.is_paid:
                    collected += per_date_amount

        # --- Pickup status distribution (for pie chart) ---
        status_distribution = [
            {"name": "Pending", "value": pending},
             {"name": "Assigned", "value": assigned},
            {"name": "On the Way", "value": on_the_way},
            {"name": "Completed", "value": completed},
            {"name": "Cancelled", "value": cancelled},
        ]

        # --- Tasks Completed vs Total Assigned ---
        tasks_progress = {
            "tasks_total": total_pickups,
            "tasks_completed": completed,
        }

        # --- Completion % Trend over time (monthly) ---
        # Group by month and calculate completion %
        trend_data = defaultdict(lambda: {"completed": 0, "total": 0})
        for s in qs:
            month_str = s.pickup_date.strftime("%Y-%m")
            trend_data[month_str]["total"] += 1
            if s.status == "Complete":
                trend_data[month_str]["completed"] += 1

        completion_trend = [
            {
                "month": month,
                "completion_percent": round((data["completed"] / data["total"] * 100) if data["total"] else 0, 2)
            }
            for month, data in sorted(trend_data.items())
        ]


         

        return Response({
            "staff_name": staff.full_name,
            "summary": {
                "total_pickups": total_pickups,
                "completed": completed,
                "pending": pending,
                "assigned": assigned,
                "on_the_way": on_the_way,
                "cancelled": cancelled,
                "cod_to_collect": round(cod_to_collect, 2),
                "collected": round(collected, 2),
            },
            "tasks_progress": tasks_progress,
            "status_distribution": status_distribution,
            "completion_trend": completion_trend,
        })


    
    def handle_partial_refund(self, status_instance):
   
        user_update = WasteRequestUserUpdate.objects.filter(
        waste_request=status_instance.waste_request,
        pickup_date=status_instance.pickup_date
    ).first()

        if not user_update:
            return

    # --- Use original amount per pickup ---
        req = status_instance.waste_request
        pickup_date_str = user_update.pickup_date.strftime("%Y-%m-%d") if hasattr(user_update.pickup_date, "strftime") else str(user_update.pickup_date)
    
    # Original per-date amount (like in admin breakdown)
        total_dates = len(req.pickup_dates or [])
        original_share = Decimal(req.final_amount or 0) / max(total_dates, 1)

        updated_amount = Decimal(user_update.final_amount or 0)

    # Refund only if updated < original
        refund_amount = original_share - updated_amount
        if refund_amount <= 0:
            return  # nothing to refund

        transaction_id = req.transaction_id
        if not transaction_id:
            return

    # Trigger Razorpay partial refund
        refund_result = initiate_razorpay_refund(
            transaction_id=transaction_id,
            old_amount=float(original_share),
        new_amount=float(updated_amount),
        reason="update"
    )

        if refund_result.get("success"):
            user_update.partial_refund_amount = float(refund_amount)
            user_update.partial_refund_id = refund_result.get("refund_id")
            user_update.partial_refund_status = "Refund_initiated"
            user_update.partial_refund_processed_at = timezone.now()
        else:
            user_update.partial_refund_status = "Failed"

        user_update.save()

        print(f"Partial refund of {refund_amount} processed for Order {req.order_id}, Pickup {status_instance.pickup_date}")








    