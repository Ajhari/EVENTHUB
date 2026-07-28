# EventHub

EventHub is an event management vendor finder web application.

The platform helps customers find event management vendors in one place. Customers can filter vendors, view vendor details, check available dates, and send inquiries. Vendors can create their profile, manage booked dates, and view customer inquiries.

## Problem Statement

Customers usually need to search many separate websites or contacts to find event management teams for weddings, birthdays, corporate events, and family functions.

EventHub solves this by bringing multiple vendors into one common platform where customers can compare vendors and contact them easily.

## User Roles

Customer:

- Register and login
- View all vendors
- Filter vendors by district, food type, event type, and available date
- Open vendor detail page
- Select an available event date
- Send an inquiry to a vendor
- Track sent inquiries in `My Inquiries`

Vendor:

- Register and login
- Create vendor profile
- Update vendor profile
- Mark booked dates in calendar
- View received customer inquiries
- Update inquiry status
- Delete vendor profile

## Main Features

- Role-based authentication for customer and vendor
- Vendor listing page
- Vendor detail page
- Vendor dashboard
- Customer inquiry form
- Customer inquiry history page
- District, food type, event type, and date filters
- Vendor booked date calendar
- Backend validation for important forms
- PostgreSQL database connection
- Responsive UI for desktop and mobile

## Tech Stack

- React
- React Router
- Express.js
- PostgreSQL
- CSS

## Main Pages

- `/vendors` - vendor listing and filters
- `/vendors/:id` - vendor detail and inquiry form
- `/vendor/dashboard` - vendor profile, booked dates, and received inquiries
- `/my-inquiries` - customer inquiry history
- `/login` - login page
- `/register` - register page

## Database

Database name:

```text
eventhub
```

Tables used:

- `users`
- `vendors`
- `vendor_services`
- `vendor_booked_dates`
- `inquiries`

## Environment Variables

Create `server/.env`:

```text
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/eventhub
PORT=3001
```

Do not share the real `.env` file because it contains your database password.

## How To Run

Backend:

```powershell
cd server
npm.cmd start
```

Frontend:

```powershell
cd client
npm.cmd run dev
```

Open the app:

```text
http://localhost:5173/vendors
```

## Backend API Routes

Auth:

- `POST /api/auth/register`
- `POST /api/auth/login`

Vendors:

- `GET /api/vendors`
- `GET /api/vendors?location=CHENNAI`
- `GET /api/vendors?foodType=VEG`
- `GET /api/vendors?eventType=WEDDING`
- `GET /api/vendors?availableDate=2026-08-20`
- `GET /api/vendors/:id`
- `GET /api/vendors/user/:userId`
- `POST /api/vendors`
- `PUT /api/vendors/:id`
- `DELETE /api/vendors/:id`

Availability:

- `GET /api/vendor-availability/:vendorId`
- `GET /api/vendor-booked-dates/:vendorId`
- `PUT /api/vendor-booked-dates/:vendorId`

Inquiries:

- `POST /api/inquiries`
- `GET /api/inquiries/vendor/:vendorId`
- `GET /api/inquiries/customer/:customerId`
- `PUT /api/inquiries/:id/status`

## Final Demo Flow

Use this flow during capstone demo:

1. Open `http://localhost:5173/vendors`
2. Register a vendor account
3. Login as vendor
4. Go to `/vendor/dashboard`
5. Create or update vendor profile
6. Select booked dates in the vendor calendar and save
7. Logout
8. Register a customer account
9. Login as customer
10. Go to `/vendors`
11. Filter vendors by district, food type, event type, or available date
12. Click one vendor card
13. Select an available date from the calendar
14. Send an inquiry
15. Logout
16. Login again as vendor
17. View the received inquiry in vendor dashboard
18. Update inquiry status to `viewed` or `replied`
19. Logout
20. Login again as customer
21. Go to `/my-inquiries`
22. Confirm the inquiry status is updated

Expected result:

- Vendor profile is saved
- Booked dates are saved
- Customer can find vendors using filters
- Customer can send inquiry only on available dates
- Vendor can view and update inquiry status
- Customer can track the updated inquiry status

## Validation And Rules

- Password should have at least 6 characters
- Email should contain `@`
- Vendor contact number should have at least 10 digits
- Inquiry message should have at least 10 characters
- Customers cannot send inquiries on booked dates
- Vendor profile text is saved/displayed in uppercase for clean UI

## UI Improvements

- Final polished navbar
- Animated EventHub hero section
- Compact vendor cards
- Custom dropdown filters that open below the input
- Dropdown list shows limited options with scroll
- Responsive layout for mobile screens
- Clear success and error messages

## Verification Commands

Frontend build:

```powershell
cd client
npm.cmd run build
```

Backend syntax check:

```powershell
cd server
node --check server.js
```

## Known Limitations

- Passwords are stored as plain text for learning purpose only
- JWT authentication is not added yet
- The app uses localStorage for logged-in user data
- Deployment is not completed yet

## Future Improvements

- Add password hashing
- Add JWT-based authentication
- Add vendor images or portfolio photos
- Add ratings and reviews
- Add admin approval for vendors
- Add email notification for new inquiries
- Deploy frontend, backend, and database

## MVP Status

The main MVP workflow is complete:

- Vendors can create and manage profiles
- Customers can search and filter vendors
- Customers can send inquiries
- Vendors can view and update inquiries
- Customers can track inquiry status

