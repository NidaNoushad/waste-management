

# Register your models here.
from django.contrib import admin
from .models import Staff, Area
from api.models import WasteRequestStatus
from django.utils.html import format_html



@admin.register(Staff)
class StaffAdmin(admin.ModelAdmin):
    list_display = ("user", "full_name", "email", "phone","overall_performance")
    search_fields = ("user__username", "user__email", "user__profile__phone_number", "user__profile__full_name")
    filter_horizontal = ("areas",)
    readonly_fields = ("performance_summary",)


    def overall_performance(self, obj):
        # --- Query performance on the fly ---
        qs = WasteRequestStatus.objects.filter(assigned_staff=obj)

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

        return f"Total: {total_pickups}, Completed: {completed}, COD: ₹{collected}/{cod_to_collect}"

    def performance_summary(self, obj):
        """Show detailed stats in staff detail view."""
        qs = WasteRequestStatus.objects.filter(assigned_staff=obj)

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

        return format_html(
            """
            <b>Total pickups:</b> {} <br>
            <b>Completed:</b> {} <br>
            <b>Assigned:</b> {} <br>
            <b>On the way:</b> {} <br>
            <b>Cancelled:</b> {} <br>
            <b>COD to collect:</b> ₹{} <br>
            <b>Collected:</b> ₹{}
            """,
            total_pickups, completed, assigned, on_the_way, cancelled, cod_to_collect, collected
        )


   



@admin.register(Area)
class AreaAdmin(admin.ModelAdmin):
    list_display = ("name", "zipcodes")
    search_fields = ("name", "zipcodes")




