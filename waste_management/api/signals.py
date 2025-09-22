from django.db.models.signals import post_save,pre_save
from django.contrib.auth.models import User
from django.dispatch import receiver
from django.conf import settings
from django.core.mail import send_mail
from .models import UserProfile
from .models import WasteRequest, WasteRequestStatus


@receiver(post_save, sender=WasteRequest)
def create_pickup_status(sender, instance, created, **kwargs):
    if created:
        for date in instance.pickup_dates or []:
            WasteRequestStatus.objects.get_or_create(
                waste_request=instance,
                pickup_date=date
            )


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)
    else:
        # make sure profile exists for old users too
        UserProfile.objects.get_or_create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    # instance.userprofile.save()
      instance.profile.save()

@receiver(pre_save, sender=WasteRequestStatus)
def cache_old_status(sender, instance, **kwargs):
    if instance.pk:
        old = WasteRequestStatus.objects.get(pk=instance.pk)
        instance._old_status = old.status
    else:
        instance._old_status = None



@receiver(post_save, sender=WasteRequestStatus)
def send_status_email(sender, instance, created, **kwargs):
    user = instance.waste_request.user
    recipient_email = getattr(user, "email", None) or getattr(instance.waste_request, "email", None)

    if not recipient_email:
        return

    # Skip email if status is Pending
    if instance.status == "Pending":
        return

    # User full name
    user_name = getattr(user.profile, "full_name", None) or user.username

    # Only send if status changed (or first created)
    if getattr(instance, "_old_status", None) != instance.status or created:
        subject = f"Waste Pickup Status Update - {instance.status}"
        pickup_date_str = instance.pickup_date.strftime("%Y-%m-%d") if instance.pickup_date else "N/A"

        # Custom messages per status
        if instance.status == "Assigned" and instance.assigned_staff:
            staff_name = instance.assigned_staff.full_name
            message = (
                f"Hello {user_name},\n\n"
                f"Your waste pickup request (Order ID: {instance.waste_request.order_id}) has been assigned.\n\n"
                f"Pickup Date: {pickup_date_str}\n"
                f"Assigned Staff: {staff_name}\n\n"
                f"Please keep your waste ready for pickup on the scheduled date.\n\n"
                f"Thank you for using our waste management service!\n"
                f"Best regards,\nGoTrash"
            )
        elif instance.status == "On the Way":
            message = (
                f"Hello {user_name},\n\n"
                f"Your waste pickup request (Order ID: {instance.waste_request.order_id}) is on the way.\n\n"
                f"Pickup Date: {pickup_date_str}\n\n"
                f"Please keep your waste ready for collection.\n\n"
                f"Thank you for using our waste management service!\n"
                f"Best regards,\nGoTrash"
            )
        elif instance.status == "Complete":
            message = (
                f"Hello {user_name},\n\n"
                f"Your waste pickup request (Order ID: {instance.waste_request.order_id}) has been completed successfully.\n\n"
                f"We appreciate your effort in keeping your area clean.\n\n"
                f"Thank you for using our waste management service!\n"
                f"Best regards,\nGoTrash"
            )
        else:
            # For other statuses (Cancelled, etc.)
            message = (
                f"Hello {user_name},\n\n"
                f"The status of your waste pickup request (Order ID: {instance.waste_request.order_id}) "
                f"has been updated to '{instance.status}'.\n\n"
                f"Scheduled Pickup Date: {pickup_date_str}\n\n"
                f"Thank you for using our waste management service!\n"
                f"Best regards,\nGoTrash"
            )

        # Send email
        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [recipient_email],
                fail_silently=False,
            )
            print(f" Email sent to {recipient_email}")
        except Exception as e:
            print(f" Email sending failed: {e}")


