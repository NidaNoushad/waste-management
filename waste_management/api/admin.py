from django.utils.html import format_html
from django.contrib import admin
from django import forms
from datetime import datetime
from .serializers import WasteRequestSerializer
from .models import WasteRequest, Notification, Payment, Refund, CollectionDetail, RequestUpdate, WasteCategory, StaffProfile, City, PickupDate, WasteRequestStatus, WasteRequestPickup, WasteRequestUserUpdate, WasteRequestCancelled,Invoice,Feedback


class InvoiceInline(admin.TabularInline):  # or StackedInline if you want full form style
    model = Invoice
    extra = 1   # how many empty invoice forms to show
    fields = ("related_update", "invoice_file", "created_at")
    readonly_fields = ("created_at",)

class WasteRequestCancelledInline(admin.TabularInline):

    model = WasteRequestCancelled
    extra = 0
    fields = ['pickup_date', 'waste_type', 'category', 'amount', 'cancelled_by']
    readonly_fields = ['pickup_date', 'waste_type', 'category', 'amount', 'cancelled_by']

    # Add a custom field for per-pickup amount
    def amount(self, obj):
        # obj is WasteRequestCancelled
        # obj.waste_request is the related WasteRequest
        from .serializers import WasteRequestSerializer
        per_date_breakdown = WasteRequestSerializer(obj.waste_request).data.get("per_date_breakdown", {}).get("breakdown", [])
        return next((item["updated_amount"] for item in per_date_breakdown if item["pickup_date"] == str(obj.pickup_date)), 0)
    
    amount.short_description = "Amount"


@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ("id", "waste_request","comment", "user", "pickup_date", "rating", "created_at")
    list_filter = ("rating", "created_at")
    search_fields = ("waste_request__order_id", "user__username", "comment")


class WasteRequestStatusAdmin(admin.ModelAdmin):
    list_display = ("waste_request", "pickup_date", "status", "updated_by", "updated_at")
    list_filter = ("status", "pickup_date")
    search_fields = ("waste_request__order_id", "waste_category", "waste_type")
    readonly_fields = ("waste_category", "waste_type", "updated_at")

@admin.register(WasteRequestCancelled)
class WasteRequestCancelledAdmin(admin.ModelAdmin):
    list_display = ("waste_request", "pickup_date", "cancelled_by", "final_amount", "cancelled_at")
    list_filter = ("cancelled_by",)
    search_fields = ("waste_request__order_id", "category", "waste_type")


@admin.register(WasteRequestUserUpdate)
class WasteRequestUserUpdateAdmin(admin.ModelAdmin):
    # model = WasteRequestUserUpdate
    # extra = 0
    # fields = ['pickup_date', 'weight', 'category', 'waste_type', 'final_amount', 'updated_by', 'updated_at']
 
    list_display = ("waste_request", "pickup_date", "updated_by", "updated_at")
    list_filter = ("updated_at", "updated_by")
    readonly_fields = ['updated_by', 'updated_at']
    
class WasteRequestUserUpdateInline(admin.TabularInline):
    model = WasteRequestUserUpdate
    extra = 0
    fields = ['pickup_date', 'weight', "economy_weight_option", 'address', 'category', 'waste_type', 'final_amount', 'updated_by', 'updated_at']
    readonly_fields = ['updated_by', 'updated_at']


class WasteRequestStatusInline(admin.TabularInline):
    model = WasteRequestStatus
    extra = 0
    fields = ['pickup_date', 'status', 'updated_by', 'updated_at']
    readonly_fields = ['updated_by', 'updated_at']


class WasteRequestAdmin(admin.ModelAdmin):
    list_display = ['order_id', 'name', 'user', 'category', 'waste_type', 'has_user_updates', 'updated_dates', 'show_per_date_breakdown']
    search_fields = ['order_id', 'name', 'email', 'phone']
    inlines = [WasteRequestStatusInline, WasteRequestUserUpdateInline,  WasteRequestCancelledInline, InvoiceInline]

    # --- Step 3: Flag if there are any user updates ---
    def has_user_updates(self, obj):
        return obj.wasterequestuserupdate_set.filter(is_manual=True).exists()
        # return obj.wasterequestuserupdate_set.exists()
    has_user_updates.boolean = True
    has_user_updates.short_description = "User Updates?"

    # --- Step 3: Show updated pickup dates ---
    def updated_dates(self, obj):
        updates = obj.wasterequestuserupdate_set.all().order_by('pickup_date')
        return ", ".join([str(u.pickup_date) for u in updates])
    updated_dates.short_description = "Updated Pickup Dates"
    
    def show_per_date_breakdown(self, obj):
     if not obj.pickup_dates:
        return "-"

    # Get updates
    #  updates = obj.wasterequestuserupdate_set.all()
     updates = obj.wasterequestuserupdate_set.filter(is_manual=True)
     update_dict = {
        (upd.pickup_date.strftime("%Y-%m-%d") if hasattr(upd.pickup_date, "strftime") else str(upd.pickup_date)): float(upd.final_amount)
        for upd in updates
    }

    # 🔹 Cancelled dates
     cancelled_dates = obj.cancelled_pickups.values_list('pickup_date', flat=True)
     cancelled_dates = [
        (d.strftime("%Y-%m-%d") if hasattr(d, "strftime") else str(d))
        for d in cancelled_dates
    ]

    # 🔹 Valid dates
     valid_dates = [
        (d if hasattr(d, "strftime") else datetime.strptime(d, "%Y-%m-%d").date())
        for d in obj.pickup_dates
        if (d.strftime("%Y-%m-%d") if hasattr(d, "strftime") else str(d)) not in cancelled_dates
    ]

 
     num_dates_total = len(obj.pickup_dates or [])
     original_share = float(obj.final_amount or 0) / num_dates_total if num_dates_total else 0
     

    # --- Build HTML table ---
     table_html = '<table style="border-collapse: collapse; width: 100%;">'
     table_html += '<tr><th style="border:1px solid #ccc; padding:5px;">Week</th>'
     table_html += '<th style="border:1px solid #ccc; padding:5px;">Pickup Date</th>'
     table_html += '<th style="border:1px solid #ccc; padding:5px;">Original Amount</th>'
     table_html += '<th style="border:1px solid #ccc; padding:5px;">Updated Amount</th>'
     table_html += '<th style="border:1px solid #ccc; padding:5px;">Difference / Refund</th></tr>'


     for idx, d in enumerate(valid_dates):
        d_str = d.strftime("%Y-%m-%d") if hasattr(d, "strftime") else str(d)  
       
        # updated_amount = update_dict.get(d_str, 0)
        # difference = updated_amount - original_share
        # Get manual update if exists, else None
        updated_amount = update_dict.get(d_str)  # None if no manual update
# For display, show 0.00 if no update
        display_updated = updated_amount if updated_amount is not None else 0
# Only calculate difference if a manual update exists
        difference = (updated_amount - original_share) if updated_amount is not None else 0


    # Format texts for display
        # updated_text = f"₹{updated_amount:.2f}"
        updated_text = f"₹{display_updated:.2f}"

        if difference < 0:
            diff_text = f"Refund: ₹{abs(difference):.2f}"
        elif difference > 0:
            diff_text = f"Extra: ₹{difference:.2f}"
        else:
            diff_text = "₹0.00"
            # updated_text = f"₹{updated_amount:.2f}"
  

        table_html += f'<tr>'
        table_html += f'<td style="border:1px solid #ccc; padding:5px;">{idx + 1}</td>'
        table_html += f'<td style="border:1px solid #ccc; padding:5px;">{d}</td>'
        table_html += f'<td style="border:1px solid #ccc; padding:5px;">₹{original_share:.2f}</td>'
        # table_html += f'<td style="border:1px solid #ccc; padding:5px;">₹{updated_amount:.2f}</td>'
        table_html += f'<td style="border:1px solid #ccc; padding:5px;">{updated_text}</td>'
        table_html += f'<td style="border:1px solid #ccc; padding:5px;">{diff_text}</td>'
        table_html += '</tr>'

     table_html += '</table>'
     return format_html(table_html)


    show_per_date_breakdown.short_description = "Per-Date Amount Breakdown"


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ("id", "related_request", "related_update", "invoice_file", "created_at")
    list_filter = ("created_at", "related_request")
    search_fields = ("related_request__id",)




admin.site.register(WasteRequestStatus)
admin.site.register(WasteRequestPickup)
admin.site.register(WasteRequest, WasteRequestAdmin)
admin.site.register(Notification)
admin.site.register(Payment)
admin.site.register(Refund)
admin.site.register(CollectionDetail)
admin.site.register(RequestUpdate)
admin.site.register(WasteCategory)
admin.site.register(StaffProfile)
admin.site.register(City)
admin.site.register(PickupDate)



# Register your models here.
