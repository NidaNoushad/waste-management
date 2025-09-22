from django.shortcuts import render




# adminpanel/views.py
from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.permissions import IsAdminUser
from rest_framework.pagination import PageNumberPagination
from rest_framework.views import APIView
from rest_framework.response import Response
from api.models import UserProfile,WasteRequest,WasteRequestUserUpdate,WasteRequestCancelled
from api.serializers import  WasteRequestUserUpdateSerializer,WasteRequestCancelledSerializer,UserProfileSerializer
from .serializers import AdminUserSerializer

class AdminUserListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        profiles = UserProfile.objects.filter(user__is_staff=False, user__is_superuser=False)
        serializer = AdminUserSerializer(profiles, many=True)
        return Response(serializer.data)

class AdminWasteRequestListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, user_id):
        requests = WasteRequest.objects.filter(user_id=user_id)
        data = [{"id": r.id, "status": r.status, "preferred_date": r.preferred_date} for r in requests]
        return Response(data)

class AdminUserUpdateListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, user_id):
        # paginator = PageNumberPagination()
        # paginator.page_size = 10
        # Get all WasteRequestUserUpdate objects for this user
        updates = WasteRequestUserUpdate.objects.filter(waste_request__user__id=user_id,is_manual=True)
        serializer = WasteRequestUserUpdateSerializer(updates, many=True)
        # return paginator.get_paginated_response(serializer.data)
        return Response(serializer.data)


class AdminUserCancelledListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, user_id):
        cancelled_list = WasteRequestCancelled.objects.filter(waste_request__user__id=user_id)
        serializer = WasteRequestCancelledSerializer(cancelled_list, many=True)
        return Response(serializer.data)

class AdminUserCancelRequestUpdateView(RetrieveUpdateAPIView):

    queryset = WasteRequestCancelled.objects.all()
    serializer_class = WasteRequestCancelledSerializer
    permission_classes = [IsAdminUser]

class AdminUserProfileView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, user_id):
        profile = UserProfile.objects.get(user_id=user_id)
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)

    def put(self, request, user_id):
        profile = UserProfile.objects.get(user_id=user_id)
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

