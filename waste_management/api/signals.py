from django.db.models.signals import post_save
from django.contrib.auth.models import User
from django.dispatch import receiver
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

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.userprofile.save()
