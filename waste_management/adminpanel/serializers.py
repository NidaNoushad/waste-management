# adminpanel/serializers.py
from rest_framework import serializers
from api.models import UserProfile
from staff.models import Staff,Area
from django.contrib.auth.models import User

class AdminUserSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username')  # from User model
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    name = serializers.SerializerMethodField()  # from UserProfile
    email = serializers.SerializerMethodField() 

    class Meta:
        model = UserProfile
        fields = ['id', 'user_id','username', 'name', 'email', 'phone_number', 'city', 'zipcode']

    def get_name(self, obj):
        # fallback to username if full_name is empty
        return obj.full_name if obj.full_name else obj.user.username

    def get_email(self, obj):
        return obj.user.email





class StaffCreateSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    full_name = serializers.CharField()
    phone_number = serializers.CharField()
    areas = serializers.ListField(child=serializers.IntegerField(), required=False)

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists")
        return value

    def create(self, validated_data):
        # 1️⃣ Create User
        user = User.objects.create(
            username=validated_data['email'],
            email=validated_data['email'],
            is_staff=True  # mark as staff
        )
        user.set_password(validated_data['password'])
        user.save()

        # 2️⃣ Create UserProfile safely
        profile, created = UserProfile.objects.get_or_create(
            user=user,
            defaults={
                "full_name": validated_data['full_name'],
                "phone_number": validated_data['phone_number']
            }
        )
        if not created:
            # Update if profile exists
            profile.full_name = validated_data['full_name']
            profile.phone_number = validated_data['phone_number']
            profile.save()

        # 3️⃣ Create Staff entry
        staff = Staff.objects.create(user=user)

        # 4️⃣ Assign Areas if provided
        area_ids = validated_data.get('areas', [])
        if area_ids:
            areas = Area.objects.filter(id__in=area_ids)
            staff.areas.set(areas)
        
        return staff


class StaffAssignAreasSerializer(serializers.Serializer):
    areas = serializers.ListField(
        child=serializers.IntegerField(), required=False
    )

    def update(self, instance, validated_data):
        area_ids = validated_data.get("areas", [])
        areas = Area.objects.filter(id__in=area_ids)
        instance.areas.set(areas)
        instance.save()
        return instance
