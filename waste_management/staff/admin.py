

# Register your models here.
from django.contrib import admin
from .models import Staff, Area



@admin.register(Staff)
class StaffAdmin(admin.ModelAdmin):
    list_display = ("user", "full_name", "email", "phone")
    search_fields = ("user__username", "user__email", "user__profile__phone_number", "user__profile__full_name")
    filter_horizontal = ("areas",)

# class StaffAdmin(admin.ModelAdmin):
#     list_display = ("user", "email", "phone")
#     search_fields = ("user__username", "email", "phone")
#     filter_horizontal = ("areas",)  # if you use ManyToManyField for areas

@admin.register(Area)
class AreaAdmin(admin.ModelAdmin):
    list_display = ("name", "zipcodes")
    search_fields = ("name", "zipcodes")

