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


