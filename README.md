# EventHub

EventHub is an event management vendor finder web application.

It helps customers find event vendors in one place. Customers can filter vendors, view details, check availability, save favorites, and send inquiries. Vendors can create profiles, mark booked dates, and manage customer inquiries.

## Tech Stack

- React
- React Router
- Express.js
- PostgreSQL
- JWT authentication
- CSS

## User Roles

Customer:

- Register and login
- Browse vendors
- Filter vendors by district, food type, event type, and available date
- Save favorite vendors
- Open vendor details
- Send inquiry for available dates
- Track sent inquiries

Vendor:

- Register and login
- Create and update vendor profile
- Add business details, food type, event type, and image
- Mark booked dates in calendar
- View received customer inquiries
- Update inquiry status
- Delete vendor profile

## Main Pages

- `/` - about page
- `/vendors` - vendor listing and filters
- `/vendors/:id` - vendor detail and inquiry form
- `/favorites` - saved vendors
- `/my-inquiries` - customer inquiry history
- `/vendor/dashboard` - vendor profile, booked dates, and received inquiries
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
- `favorite_vendors`
- `inquiries`

## Environment Variables

Create `server/.env`:

```text
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/eventhub
PORT=3001
JWT_SECRET=your_secret_key_here
```

Do not push the real `.env` file because it contains secrets.

## How To Run

Backend:

```powershell
cd server
npm.cmd run hari
```

Frontend:

```powershell
cd client
npm.cmd run dev
```

Open:

```text
http://localhost:5173
```

## Backend API Routes

Auth:

- `POST /api/auth/register`
- `POST /api/auth/login`

Vendors:

- `GET /api/vendors`
- `GET /api/vendors/:id`
- `GET /api/vendors/user/:userId`
- `POST /api/vendors`
- `PUT /api/vendors/:id`
- `DELETE /api/vendors/:id`

Favorites:

- `GET /api/favorites/:customerId`
- `GET /api/favorites/:customerId/:vendorId`
- `POST /api/favorites`
- `DELETE /api/favorites/:customerId/:vendorId`

Availability:

- `GET /api/vendor-availability/:vendorId`
- `GET /api/vendor-booked-dates/:vendorId`
- `PUT /api/vendor-booked-dates/:vendorId`

Inquiries:

- `POST /api/inquiries`
- `GET /api/inquiries/vendor/:vendorId`
- `GET /api/inquiries/customer/:customerId`
- `PUT /api/inquiries/:id/status`

## JWT Auth Flow

1. User registers or logs in.
2. Backend returns `user` and `token`.
3. Frontend saves them in localStorage.
4. Protected API requests send:

```text
Authorization: Bearer TOKEN
```

5. Backend verifies token before allowing private actions.

## Final Demo Flow

1. Open `http://localhost:5173`
2. Register a vendor account
3. Login as vendor
4. Go to `/vendor/dashboard`
5. Create or update vendor profile
6. Add food type, event type, and profile image
7. Mark booked dates and save
8. Logout
9. Register a customer account
10. Login as customer
11. Go to `/vendors`
12. Filter vendors by district, food type, event type, or available date
13. Save one vendor to favorites
14. Open a vendor card
15. Select an available date and send inquiry
16. Go to `/my-inquiries`
17. Logout
18. Login again as vendor
19. View received inquiry in dashboard
20. Update inquiry status
21. Login again as customer and confirm status update

## Validation And Rules

- Password should have at least 6 characters
- Email should contain `@`
- Vendor contact number should have at least 10 digits
- Inquiry message should have at least 10 characters
- Customers cannot send inquiries on booked dates
- Vendor profile text is saved/displayed in uppercase
- Customers need login to save favorites and send inquiries
- Vendors need login to manage profile and inquiries

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
- Deployment is not completed yet

## Future Improvements

- Add password hashing with bcrypt
- Add ratings and reviews
- Add admin approval for vendors
- Add email notification for new inquiries
- Deploy frontend, backend, and database

## MVP Status

The MVP workflow is complete:

- Vendors can create and manage profiles
- Customers can search and filter vendors
- Customers can save favorites
- Customers can send inquiries
- Vendors can view and update inquiries
- Customers can track inquiry status
