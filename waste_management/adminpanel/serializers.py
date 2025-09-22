# adminpanel/serializers.py
from rest_framework import serializers
from api.models import UserProfile

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

