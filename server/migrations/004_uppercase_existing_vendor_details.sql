UPDATE vendors
SET business_name = UPPER(business_name),
    location = UPPER(location),
    description = UPPER(description),
    price_range = UPPER(price_range),
    food_type = UPPER(food_type),
    event_type = UPPER(event_type);
