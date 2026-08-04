# EventHub API Documentation

This file lists all backend APIs used by the EventHub website.

## Base URLs

Local backend:

```txt
http://localhost:3001
```

Deployed backend:

```txt
https://your-render-backend-url.onrender.com
```

Frontend should call deployed backend using:

```txt
VITE_API_BASE_URL=https://your-render-backend-url.onrender.com
```

## Auth Note

Some APIs are protected. Protected APIs need the user to be logged in.

- Customer-only APIs need a logged-in customer.
- Vendor-only APIs need a logged-in vendor.
- The backend stores the login token in the `eventhubToken` httpOnly cookie.

## Public APIs

### Check API Home

```txt
GET /
```

Hits:

```txt
http://localhost:3001/
```

Purpose:
Checks whether the EventHub API server is running.

Expected response:

```txt
EventHub API is running
```

### Health Check

```txt
GET /api/health
```

Hits:

```txt
http://localhost:3001/api/health
```

Purpose:
Used after deployment to check whether backend is alive.

Expected response:

```json
{
  "status": "ok",
  "message": "EventHub backend is healthy"
}
```

## Vendor APIs

### Get All Vendors

```txt
GET /api/vendors
```

Hits:

```txt
http://localhost:3001/api/vendors
```

Purpose:
Shows all vendor cards on the Explore Vendors page.

Optional filters:

```txt
location
foodType
eventType
availableDate
sort
```

Example:

```txt
http://localhost:3001/api/vendors?location=CHENNAI&foodType=VEG&eventType=WEDDING&availableDate=2026-08-20
```

What it checks:

- Location matches vendor location.
- Food type matches vendor food type.
- Event type matches vendor event type.
- Available date should not be in `vendor_booked_dates`.
- Available date should not already have an inquiry booking.

### Get One Vendor By Id

```txt
GET /api/vendors/:id
```

Hits:

```txt
http://localhost:3001/api/vendors/1
```

Purpose:
Shows one vendor detail page.

### Get Vendor Profile By User Id

```txt
GET /api/vendors/user/:userId
```

Hits:

```txt
http://localhost:3001/api/vendors/user/1
```

Auth:
Vendor login required.

Purpose:
Vendor Dashboard loads the logged-in vendor profile.

### Create Vendor Profile

```txt
POST /api/vendors
```

Hits:

```txt
http://localhost:3001/api/vendors
```

Auth:
Vendor login required.

Purpose:
Creates a vendor profile from Vendor Dashboard.

Body type:
`multipart/form-data` because vendor can upload image file.

Fields:

```txt
user_id
business_name
location
contact_number
description
price_range
food_type
event_type
available_date
vendor_image
```

Validation:

- `user_id`, `business_name`, and `location` are required.
- Contact number should have at least 10 digits.
- Vendor can create only their own profile.

### Update Vendor Profile

```txt
PUT /api/vendors/:id
```

Hits:

```txt
http://localhost:3001/api/vendors/1
```

Auth:
Vendor login required.

Purpose:
Updates vendor profile details and image.

Body type:
`multipart/form-data`

Fields:

```txt
business_name
location
contact_number
description
price_range
food_type
event_type
available_date
vendor_image
```

Validation:

- `business_name` and `location` are required.
- Vendor can update only their own profile.

### Delete Vendor Image

```txt
DELETE /api/vendors/:id/image
```

Hits:

```txt
http://localhost:3001/api/vendors/1/image
```

Auth:
Vendor login required.

Purpose:
Removes uploaded image from the vendor profile.

### Delete Vendor Profile

```txt
DELETE /api/vendors/:id
```

Hits:

```txt
http://localhost:3001/api/vendors/1
```

Auth:
Vendor login required.

Purpose:
Deletes the vendor profile.

## Favorites APIs

### Get Customer Favorites

```txt
GET /api/favorites/:customerId
```

Hits:

```txt
http://localhost:3001/api/favorites/1
```

Auth:
Customer login required.

Purpose:
Shows saved vendors on the Favorites page.

### Check If Vendor Is Favorite

```txt
GET /api/favorites/:customerId/:vendorId
```

Hits:

```txt
http://localhost:3001/api/favorites/1/2
```

Auth:
Customer login required.

Purpose:
Checks whether a vendor card is already saved by the logged-in customer.

Expected response:

```json
{
  "is_favorite": true
}
```

### Add Vendor To Favorites

```txt
POST /api/favorites
```

Hits:

```txt
http://localhost:3001/api/favorites
```

Auth:
Customer login required.

Purpose:
Saves a vendor card to Favorites.

JSON body:

```json
{
  "customer_id": 1,
  "vendor_id": 2
}
```

### Remove Vendor From Favorites

```txt
DELETE /api/favorites/:customerId/:vendorId
```

Hits:

```txt
http://localhost:3001/api/favorites/1/2
```

Auth:
Customer login required.

Purpose:
Removes a saved vendor from Favorites.

## Vendor Services APIs

### Add One Vendor Service Date

```txt
POST /api/vendor-services
```

Hits:

```txt
http://localhost:3001/api/vendor-services
```

Auth:
Vendor login required.

Purpose:
Adds one service availability record.

JSON body:

```json
{
  "vendor_id": 1,
  "event_type": "WEDDING",
  "food_type": "VEG AND NON-VEG",
  "available_date": "2026-08-20"
}
```

### Add Vendor Service Date Range

```txt
POST /api/vendor-services/range
```

Hits:

```txt
http://localhost:3001/api/vendor-services/range
```

Auth:
Vendor login required.

Purpose:
Adds service availability for multiple dates in a range.

JSON body:

```json
{
  "vendor_id": 1,
  "event_type": "WEDDING",
  "food_type": "VEG AND NON-VEG",
  "start_date": "2026-08-01",
  "end_date": "2026-08-20"
}
```

Validation:

- All fields are required.
- Start date cannot be after end date.
- Already booked dates are skipped.

### Get Vendor Services

```txt
GET /api/vendor-services/:vendorId
```

Hits:

```txt
http://localhost:3001/api/vendor-services/1
```

Purpose:
Gets saved service details for one vendor.

## Booked Dates APIs

### Get Vendor Booked Dates

```txt
GET /api/vendor-booked-dates/:vendorId
```

Hits:

```txt
http://localhost:3001/api/vendor-booked-dates/1
```

Auth:
Vendor login required.

Purpose:
Vendor Dashboard calendar shows booked dates in red.

Returns:

```json
{
  "manual_booked_dates": [],
  "inquiry_booked_dates": []
}
```

### Save Vendor Booked Dates

```txt
PUT /api/vendor-booked-dates/:vendorId
```

Hits:

```txt
http://localhost:3001/api/vendor-booked-dates/1
```

Auth:
Vendor login required.

Purpose:
Vendor clicks multiple dates in calendar and saves them as booked/unavailable.

JSON body:

```json
{
  "booked_dates": ["2026-08-10", "2026-08-15"]
}
```

### Get Public Vendor Availability

```txt
GET /api/vendor-availability/:vendorId
```

Hits:

```txt
http://localhost:3001/api/vendor-availability/1
```

Purpose:
Customer side can check vendor unavailable dates.

## Inquiry APIs

### Send Inquiry

```txt
POST /api/inquiries
```

Hits:

```txt
http://localhost:3001/api/inquiries
```

Auth:
Customer login required.

Purpose:
Customer sends inquiry to a vendor.

JSON body:

```json
{
  "customer_id": 1,
  "vendor_id": 2,
  "event_date": "2026-08-20",
  "message": "I want to know your package details."
}
```

Validation:

- All fields are required.
- Message should be at least 10 characters.
- Customer can send only from their own account.
- Date should not already be booked.

### Get Vendor Inquiries

```txt
GET /api/inquiries/vendor/:vendorId
```

Hits:

```txt
http://localhost:3001/api/inquiries/vendor/1
```

Auth:
Vendor login required.

Purpose:
Vendor Dashboard shows customer inquiries.

Extra behavior:
When vendor opens this API, new inquiries are marked as `viewed`.

### Get Customer Inquiries

```txt
GET /api/inquiries/customer/:customerId
```

Hits:

```txt
http://localhost:3001/api/inquiries/customer/1
```

Auth:
Customer login required.

Purpose:
My Inquiries page shows inquiries sent by the logged-in customer.

### Update Inquiry Status

```txt
PUT /api/inquiries/:id/status
```

Hits:

```txt
http://localhost:3001/api/inquiries/1/status
```

Auth:
Vendor login required.

Purpose:
Vendor changes inquiry status.

JSON body:

```json
{
  "status": "viewed"
}
```

Allowed status values:

```txt
new
viewed
replied
```

### Vendor Reply To Inquiry

```txt
PUT /api/inquiries/:id/reply
```

Hits:

```txt
http://localhost:3001/api/inquiries/1/reply
```

Auth:
Vendor login required.

Purpose:
Vendor replies to customer inquiry.

JSON body:

```json
{
  "reply": "Yes, we are available on that date."
}
```

Validation:
Reply should be at least 3 characters.

### Customer Reply To Vendor

```txt
PUT /api/inquiries/:id/customer-reply
```

Hits:

```txt
http://localhost:3001/api/inquiries/1/customer-reply
```

Auth:
Customer login required.

Purpose:
Customer replies back to vendor in inquiry chat.

JSON body:

```json
{
  "reply": "Okay, please share your package."
}
```

Validation:
Reply should be at least 3 characters.

## Auth APIs

### Register

```txt
POST /api/auth/register
```

Hits:

```txt
http://localhost:3001/api/auth/register
```

Purpose:
Creates a customer or vendor account.

JSON body:

```json
{
  "name": "Hari",
  "email": "hari@gmail.com",
  "password": "123456",
  "role": "customer"
}
```

Validation:

- All fields are required.
- Password should be at least 6 characters.
- Only `gmail.com` email addresses are allowed.
- Role should be `customer` or `vendor`.
- Password is stored as bcrypt hash.

### Login

```txt
POST /api/auth/login
```

Hits:

```txt
http://localhost:3001/api/auth/login
```

Purpose:
Logs in a customer or vendor.

JSON body:

```json
{
  "email": "hari@gmail.com",
  "password": "123456"
}
```

What it does:

- Checks user email.
- Compares password with bcrypt hash.
- Creates JWT token.
- Stores token in `eventhubToken` httpOnly cookie.
- Returns logged-in user details.

### Logout

```txt
POST /api/auth/logout
```

Hits:

```txt
http://localhost:3001/api/auth/logout
```

Purpose:
Logs out the current user.

What it does:
Clears `eventhubToken` cookie.

## Browser Testing Note

You can directly open only `GET` APIs in browser address bar.

Examples:

```txt
http://localhost:3001/api/health
http://localhost:3001/api/vendors
http://localhost:3001/api/vendors/1
```

For `POST`, `PUT`, and `DELETE`, use:

- Frontend UI buttons/forms
- Postman
- Thunder Client
- PowerShell `Invoke-RestMethod`

Protected APIs need login cookie, so testing them directly in browser may show auth errors if you are not logged in.
