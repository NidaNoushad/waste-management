def calculate_pickup_price(waste_type, weight=None, economy_weight_option=None, frequency="onlyOnce", duration=1, urgency="notUrgent"):
    base_price = 0

    if waste_type == "economy":
        if economy_weight_option == "below10":
            base_price = 60
        elif economy_weight_option == "above10" and weight:
            w = float(weight)
            if 10 < w < 25:
                base_price = w * 20
    elif waste_type == "bulk" and weight:
        base_price = float(weight) * 15

    # Apply duration
    if frequency in ["daily", "weekly", "monthly"]:
        base_price_with_duration = base_price * duration
    else:
        base_price_with_duration = base_price

    # Urgency charges
    extra_charge = 50 if urgency == "urgent" else 0
    base_price_with_duration += extra_charge

    gst_amount = round(base_price_with_duration * 0.18, 2)
    final_amount = round(base_price_with_duration + gst_amount, 2)

    return {
        "base_price": base_price,
        "extra_charge": extra_charge,
        # "additional_charges": extra_charge, 
        "gst_amount": gst_amount,
        "final_amount": final_amount,
    }










# class WasteRequestUserUpdateViewSet(viewsets.ViewSet):
#     permission_classes = [IsAuthenticated]
#     serializer_class = WasteRequestUserUpdateSerializer
  

#     def perform_update(self, serializer):
#         serializer.save(updated_by=self.request.user)

#     def update(self, request, pk=None):
#         """
#         Update user-editable fields for a specific pickup date
#         pk = WasteRequest id
#         Body = { pickup_date, waste_type, weight, economy_weight_option, category, address, email }
#         """
#         pickup_date = request.data.get("pickup_date")
#         if not pickup_date:
#             return Response({"detail": "pickup_date is required"}, status=status.HTTP_400_BAD_REQUEST)

#         try:
#             req = WasteRequest.objects.get(id=pk)
#         except WasteRequest.DoesNotExist:
#             return Response({"detail": "WasteRequest not found"}, status=status.HTTP_404_NOT_FOUND)

#         # Only allow user-editable fields
#         allowed_fields = ["waste_type", "weight", "economy_weight_option", "category", "address", "email", "base_price", "gstAmount", "final_amount" ]
#         update_data = {k: v for k, v in request.data.items() if k in allowed_fields}
# # # extra
#         if not update_data:
#             return Response({"detail": "No valid fields to update"}, status=status.HTTP_400_BAD_REQUEST)


#              # Check if a record already exists
#         user_update = WasteRequestUserUpdate.objects.filter(
#             waste_request=req,
#             pickup_date=pickup_date
#             ).first()

#         if user_update:
#         # Update only if something actually changed
#             has_changes = False
#             for k, v in update_data.items():
#                 old_value = getattr(user_update, k)
#                 if str(old_value) != str(v):
#                     setattr(user_update, k, v)
#                     has_changes = True

#             if has_changes:
#                 user_update.updated_by = request.user
#                 user_update.is_manual = True
#                 user_update.save()
#             else:
#                 return Response({"detail": "No changes detected"}, status=status.HTTP_200_OK)

#         else:
#         # Create a new record only if there are values to save
#             user_update = WasteRequestUserUpdate.objects.create(
#                 waste_request=req,
#                 pickup_date=pickup_date,
#                 updated_by=request.user,
#                 is_manual=True,
#                 **update_data
#             )

# # original
#     #     user_update, created = WasteRequestUserUpdate.objects.get_or_create(
#     #         waste_request=req,
#     #         pickup_date=pickup_date,
#     #         defaults={"updated_by": request.user, **update_data}
#     #     )

#     #     if not created:
#     #         # overwrite existing record with latest data
#     #         has_changes = False
#     #         for k, v in update_data.items():
#     #             old_value = getattr(user_update, k)
#     #             if str(old_value) != str(v):   # only if actual change
#     #                  setattr(user_update, k, v)
#     #                  has_changes = True

#     #         user_update.updated_by = request.user
#     #         user_update.is_manual = has_changes 

            




#     #         user_update.save()
#     #     else:
#     # # If newly created via user update, mark manual too
#     #         user_update.is_manual = True
#     #         user_update.save()

#     #     # Return all updated fields + order info
#     #     response_data = {
#     #         "order_id": req.order_id,
#     #         "pickup_date": pickup_date,
#     #         # Optionally include updated fields
#     #         "partial_refund_status": user_update.partial_refund_status,
#     #         "partial_refund_amount": float(user_update.partial_refund_amount),
#     #         "partial_refund_id": user_update.partial_refund_id,
#     #     }
#     #     # response_data.update(update_data)

       
        
#         serializer = WasteRequestUserUpdateSerializer(user_update)
#         return Response(serializer.data, status=status.HTTP_200_OK)
