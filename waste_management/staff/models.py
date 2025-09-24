# Create your models here.
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
# from django.utils.html import format_html


class Staff(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    areas = models.ManyToManyField("Area", blank=True, related_name="staff")
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.user.username

    @property
    def email(self):
        return self.user.email

    @property
    def phone(self):
        return self.user.profile.phone_number

    @property
    def full_name(self):
        return self.user.profile.full_name

    def save(self, *args, **kwargs):
        # Make sure the linked user is marked as staff
     if self.user and not self.user.is_staff:
            self.user.is_staff = True
            self.user.save()
     super().save(*args, **kwargs)

     


class Area(models.Model):
    name = models.CharField(max_length=100)
    zipcodes = models.TextField(
        help_text="Comma-separated zipcodes for this area (e.g. 560001,560002)"
    )

    def __str__(self):
        return self.name

    def get_zipcodes(self):
        return [z.strip() for z in self.zipcodes.split(",")]

