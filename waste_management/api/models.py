from django.db import models
from django.contrib.auth.models import User
import datetime
import random
from django.utils import timezone
from django.conf import settings
from django.db.models.signals import post_delete
from django.dispatch import receiver
from staff.models import Staff,Area

# Create your models here.
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE,related_name="profile")
    full_name = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=15)
    address = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    zipcode = models.CharField(max_length=10, blank=True, null=True)
    # ✅ NEW FIELDS
    email_notifications = models.BooleanField(default=True)
    sms_notifications = models.BooleanField(default=True)


    def __str__(self):
        return self.user.username


class City(models.Model):
    name=models.CharField(max_length=100)

    def __str__(self):
        return self.name
class PickupDate(models.Model):
    city = models.ForeignKey(City, on_delete=models.CASCADE,  related_name='pickup_dates')
    date=models.DateField()

    def __str__(self):
        return f"{self.city.name} - {self.date}"

class WasteRequest(models.Model):
    PAYMENT_METHODS = [
        ("Cash on Pickup", "Cash on Pickup"),
        ("UPI", "UPI"),
        ("Card", "Card"),
    ]
    PAYMENT_STATUS = [
        ("Pending", "Pending"),
        ("Paid", "Paid"),
        ("Failed", "Failed"),
        ("Refunded","Refunded")
    ]

    

    user = models.ForeignKey(User, on_delete=models.CASCADE)  # User ID
    # name = models.CharField(max_length=100)
    name = models.CharField(max_length=100, null=True, blank=True)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=10, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    zipcode = models.CharField(max_length=6, blank=True, null=True) 
    
    city = models.CharField(max_length=50, blank=True, null=True)
    date = models.DateField(blank=True, null=True)
    waste_type = models.CharField(max_length=20, null=True, blank=True)
    category = models.CharField(max_length=50, null=True, blank=True)
    weight = models.FloatField(null=True, blank=True)
    economy_weight_option = models.CharField(
    max_length=50, blank=True, null=True
)
    frequency = models.CharField(max_length=20, null=True, blank=True)
    urgency = models.CharField(max_length=20, null=True, blank=True)
    duration = models.IntegerField(blank=True, null=True)
    base_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    gstAmount= models.DecimalField(max_digits=10, decimal_places=2, default=0)
    # pickup_prices = models.JSONField(null=True, blank=True, help_text="Stores price per pickup date")
    additional_charges = models.FloatField(default=0)
    final_amount = models.FloatField(null=True, blank=True)
    pickup_dates=models.JSONField(null=True,blank=True)
    invoice_url = models.CharField(max_length=500, blank=True, null=True)

    # Payment fields
    payment_method = models.CharField(max_length=50, choices=PAYMENT_METHODS, null=True, blank=True)
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default="Pending")
    transaction_id = models.CharField(max_length=150, null=True, blank=True)
    receipt_file = models.FileField(upload_to="receipts/", null=True, blank=True)

    status = models.CharField(max_length=20, default="Pending")
    created_at = models.DateTimeField(auto_now_add=True)
     
     #order Id
    order_id = models.CharField(max_length=20, unique=True, blank=True, null=True)
      # auto-detected area (set when request is saved)
    area = models.ForeignKey("staff.Area", on_delete=models.SET_NULL, null=True, blank=True)
    assigned_staff = models.ForeignKey(
        Staff, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="requests"
    )

    def save(self, *args, **kwargs):
        if not self.order_id:
            today_str = datetime.datetime.now().strftime('%Y%m%d')
            random_num = random.randint(1000, 9999)
            self.order_id = f"ORD-{today_str}-{random_num}"

            
            """Automatically detect area from zipcode before saving"""
        if self.zipcode:
          
            for area in Area.objects.all():
                if self.zipcode in area.get_zipcodes():
                    self.area = area
                    break
        is_new = self.pk is None
        super().save(*args, **kwargs)

        # 3️⃣If new request, create WasteRequestStatus for each pickup date
        if is_new:
            for d in (self.pickup_dates or []):
                WasteRequestStatus.objects.get_or_create(
                waste_request=self,
                pickup_date=d,
                defaults={"status": "Pending"}
            )

        super().save(*args, **kwargs)
   

    def __str__(self):
        return f"Order {self.id} - {self.name}"
     

class WasteRequestStatus(models.Model):
    STATUS_CHOICES = [
        ("Pending", "Pending"),
        ("Assigned", "Assigned"),
        ("On the Way", "On the Way"),
        ("Complete", "Complete"),
        ("Cancelled", "Cancelled"),
    ]

    waste_request = models.ForeignKey(WasteRequest, on_delete=models.CASCADE, related_name="statuses")
    pickup_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Pending")
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
  
    # These fields will be readonly in admin
    waste_category = models.CharField(max_length=50, blank=True)
    waste_type = models.CharField(max_length=50, blank=True)

    # NEW: Store area and assigned staff per pickup
    area = models.ForeignKey("staff.Area", on_delete=models.SET_NULL, null=True, blank=True)
    assigned_staff = models.ForeignKey("staff.Staff", on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        ordering = ["-updated_at"]
        unique_together = ("waste_request", "pickup_date")  # Avoid duplicates


    def save(self, *args, **kwargs):
    # Auto-fill category and type from WasteRequest
     if self.waste_request:
        self.waste_category = self.waste_request.category
        self.waste_type = self.waste_request.waste_type



         # Auto-fill area and assigned_staff from WasteRequest if not set
     if self.waste_request and not self.area:
        self.area = self.waste_request.area
     if self.waste_request and not self.assigned_staff:
        self.assigned_staff = self.waste_request.assigned_staff

    # Store old status before saving
     old_status = None
     if self.pk:
        old_status = WasteRequestStatus.objects.get(pk=self.pk).status

    # ---- transition: Cancelled -> not Cancelled => remove cancellation log
     if old_status == "Cancelled" and self.status != "Cancelled":
        WasteRequestCancelled.objects.filter(
            waste_request=self.waste_request,
            pickup_date=self.pickup_date
        ).delete()

    # Save the status itself
     super().save(*args, **kwargs)

    # ---- transition: not Cancelled -> Cancelled => create/update cancellation log
     if self.status == "Cancelled" and old_status != "Cancelled":
        # Determine who cancelled
        if self.updated_by and self.waste_request and self.updated_by == self.waste_request.user:
            cancelled_by_user_type = "User"
        elif self.updated_by and self.updated_by.is_staff:
            cancelled_by_user_type = "Admin"
        else:
            cancelled_by_user_type = "Staff"

        # Get per-date amount
        try:
            per_date_update = WasteRequestUserUpdate.objects.get(
                waste_request=self.waste_request,
                pickup_date=self.pickup_date
            )
            final_amount_for_date = per_date_update.final_amount
        except WasteRequestUserUpdate.DoesNotExist:
            dates = self.waste_request.pickup_dates or []
            final_amount_for_date = (self.waste_request.final_amount or 0) / len(dates) if dates else 0

        # Create or update cancellation record
        WasteRequestCancelled.objects.update_or_create(
            waste_request=self.waste_request,
            pickup_date=self.pickup_date,
            defaults={
                "waste_type": self.waste_type,
                "category": self.waste_category,
                "final_amount": final_amount_for_date,
                "cancelled_by": cancelled_by_user_type,
            }
        )

    def __str__(self):
        return f"{self.waste_request.order_id} - {self.pickup_date} - {self.status}"






class WasteRequestPickup(models.Model):  
    waste_request = models.ForeignKey(WasteRequest, on_delete=models.CASCADE, related_name="pickups")
    pickup_date = models.DateField()
    waste_type = models.CharField(max_length=20, null=True, blank=True)
    weight = models.FloatField(null=True, blank=True)
    category = models.CharField(max_length=50, null=True, blank=True)

    base_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    gstAmount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    final_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    status = models.CharField(
        max_length=20,
        choices=[("Pending","Pending"),("Assigned","Assigned"),("Completed","Completed"),("Cancelled","Cancelled")],
        default="Pending"
    )

    refund_status = [
    ("Refund_initiated", "Refund Initiated"),
    ("Refunded", "Refunded"),
    ("Failed", "Failed"),
]


    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.waste_request.order_id} - {self.pickup_date}"

class WasteRequestUserUpdate(models.Model):
    waste_request = models.ForeignKey(WasteRequest, on_delete=models.CASCADE )
    pickup_date = models.DateField()
    waste_type = models.CharField(max_length=50, blank=True, null=True)
    weight = models.FloatField(blank=True, null=True)
    economy_weight_option = models.CharField(max_length=20, blank=True, null=True)
    category = models.CharField(max_length=50, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    base_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    gstAmount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    final_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    refund_id = models.CharField(max_length=100, blank=True, null=True)
    
    refund_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    refund_processed_at = models.DateTimeField(blank=True, null=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_manual = models.BooleanField(default=False) 

    class Meta:
        unique_together = ("waste_request", "pickup_date")

class WasteRequestCancelled(models.Model):
    CANCELLED_BY_CHOICES = [
        ("User", "User"),
        ("Staff", "Staff"),
        ("Admin", "Admin"),
    ]

    REFUND_STATUS_CHOICES = [
      ("Refund_initiated", "Refund Initiated"),
      ("Refunded", "Refunded"),
      ("Failed", "Failed"),
  ]


    waste_request = models.ForeignKey(WasteRequest, on_delete=models.CASCADE, related_name="cancelled_pickups")
    pickup_date = models.DateField()
    refund_id = models.CharField(max_length=100, null=True, blank=True)
    refund_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    refund_processed_at = models.DateTimeField(blank=True, null=True)
    refund_status = models.CharField(max_length=30, choices=REFUND_STATUS_CHOICES, blank=True, null=True)
    refund_error = models.TextField(null=True, blank=True)
    waste_type = models.CharField(max_length=50, blank=True)
    category = models.CharField(max_length=50, blank=True)
    final_amount = models.FloatField(default=0)  # Add this field
    cancelled_by = models.CharField(max_length=10, choices=CANCELLED_BY_CHOICES)
    cancelled_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("waste_request", "pickup_date")

    def __str__(self):
        return f"{self.waste_request.order_id} - {self.pickup_date} - Cancelled by {self.cancelled_by}"


# @receiver(post_delete, sender=WasteRequestStatus)
# def sync_when_status_deleted(sender, instance, **kwargs):
#     """
#     If a Cancelled status row is deleted from admin inline,
#     delete the matching WasteRequestCancelled row too.
#     """
#     WasteRequestCancelled.objects.filter(
#         waste_request=instance.waste_request,
#         pickup_date=instance.pickup_date
#     ).delete()

# @receiver(post_delete, sender=WasteRequestCancelled)
# def sync_when_cancelled_deleted(sender, instance, **kwargs):
#     """
#     If a WasteRequestCancelled row is deleted from admin inline,
#     restore/ensure the status is not Cancelled (back to Pending).
#     """
#     status_obj, created = WasteRequestStatus.objects.get_or_create(
#         waste_request=instance.waste_request,
#         pickup_date=instance.pickup_date,
#         defaults={"status": "Pending"}
#     )
#     if not created and status_obj.status == "Cancelled":
#         status_obj.status = "Pending"
#         status_obj.save(update_fields=["status", "updated_at"])

class Invoice(models.Model):
    related_request = models.ForeignKey("WasteRequest", on_delete=models.CASCADE, related_name="invoices")
    related_update = models.ForeignKey("WasteRequestUserUpdate", on_delete=models.SET_NULL, blank=True, null=True)
    invoice_file = models.FileField(upload_to="invoices/")
    created_at = models.DateTimeField(auto_now_add=True)



# class UserFeedback(models.Model):
    
#     waste_request = models.ForeignKey(WasteRequest, on_delete=models.CASCADE, related_name="feedbacks", default=1)
#     pickup_date = models.DateField(null=True, blank=True) 
#     user = models.ForeignKey(User, on_delete=models.CASCADE)
#     rating = models.DecimalField(max_digits=3, decimal_places=1)  # 0.0 to 5.0
#     comment = models.TextField(blank=True, null=True)
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     class Meta:
#         unique_together = ('waste_request', 'pickup_date', 'user')   # Only one feedback per user per pickup



# class Invoice(models.Model):
#     related_request = models.ForeignKey(WasteRequest, on_delete=models.CASCADE, null=True, blank=True)
#     related_update = models.ForeignKey( WasteRequestPickup, on_delete=models.CASCADE, null=True, blank=True)
#     invoice_file = models.FileField(upload_to="invoices/")
#     created_at = models.DateTimeField(auto_now_add=True)
#     amount = models.FloatField(null=True, blank=True)
#     gst_amount = models.FloatField(null=True, blank=True)
#     additional_charges = models.FloatField(null=True, blank=True)
#     def __str__(self):
#         return f"Invoice #{self.id} for Request #{self.related_request.id}"



class Feedback(models.Model):
    waste_request = models.ForeignKey(WasteRequest, on_delete=models.CASCADE, related_name="feedbacks")
    pickup_date = models.DateField()  # feedback is for a specific pickup
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    comment = models.TextField()
    rating = models.IntegerField()  # 1 to 5
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("waste_request", "pickup_date")  # one feedback per pickup

    def __str__(self):
        return f"Feedback for {self.waste_request.order_id} on {self.pickup_date}"


class ContactMessage(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    subject = models.CharField(max_length=200)
    message = models.TextField()
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    is_member = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.subject}"


class AdjustmentInvoice(models.Model):
    pickup = models.ForeignKey('WasteRequestPickup', on_delete=models.CASCADE, related_name='adjustments')
    amount = models.FloatField()
    reason = models.TextField(blank=True, null=True)
    paid = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
















class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('email', 'Email'),
        ('sms', 'SMS'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField()
    notification_type = models.CharField(max_length=10, choices=NOTIFICATION_TYPES)
    send_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.notification_type.upper()} to {self.user.username} at {self.send_at}"


class Payment(models.Model):
    PAYMENT_STATUS_CHOICES = [
        ('Paid', 'Paid'),
        ('Pending', 'Pending'),
        ('Failed', 'Failed'),
        ('Refunded', 'Refunded'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    request = models.ForeignKey('WasteRequest', on_delete=models.CASCADE)
    amount_paid = models.DecimalField(max_digits=8, decimal_places=2)
    payment_date = models.DateTimeField(auto_now_add=True)
    payment_status = models.CharField(max_length=10, choices=PAYMENT_STATUS_CHOICES, default='Pending')

    def __str__(self):
        return f"Payment #{self.id} - {self.payment_status} - ₹{self.amount_paid}"

class Refund(models.Model):
    REFUND_STATUS_CHOICES = [
        ('Requested', 'Requested'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
        ('Refunded', 'Refunded'),
    ]

    payment = models.ForeignKey('Payment', on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    refund_amount = models.DecimalField(max_digits=8, decimal_places=2)
    reason = models.TextField()
    refund_status = models.CharField(max_length=10, choices=REFUND_STATUS_CHOICES, default='Requested')
    requested_on = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Refund #{self.id} - {self.refund_status}"


