# EventHub

EventHub is an event management vendor finder platform.

Customers can search vendors, view vendor details, and send inquiries.
Vendors can create/update their profile and view received inquiries.

## Current Week 9 Checkpoint

Completed:

- React frontend created
- Express backend created
- PostgreSQL database connected
- Vendor list page
- Vendor detail page
- Location filter
- Customer inquiry form
- Vendor dashboard
- Register page
- Login page
- Logged-in user saved in localStorage
- Logout button
- Vendor-only dashboard check
- Customer-only inquiry check
- Vendor profile create/update
- Vendor can update inquiry status
- Vendor dashboard shows only own vendor inquiries
- Vendor profile form uses logged-in vendor user id
- Inquiry form uses logged-in customer user id

## Week 10 Progress

Completed:

- Separated page errors and form errors
- Added inquiry message length validation
- Added vendor contact number validation
- Added inquiry submitting state
- Added vendor profile saving state
- Added backend inquiry message validation
- Added backend vendor contact number validation
- Added vendor filter result count
- Added clear filter button
- Added vendor list sorting
- Connected vendor sorting to backend API
- Added backend support for location filter with sorting
- Added vendor dashboard inquiry status filter
- Added vendor dashboard inquiry count summary
- Added customer inquiry history page
- Added customer inquiry status filter
- Improved navbar links based on logged-in user role
- Added login redirect based on user role
- Added immediate navbar update after login
- Added logout redirect to vendors page
- Added login links on protected pages
- Added register success redirect to login page
- Added register submitting state
- Added login submitting state
- Added register password length validation
- Separated login success and error messages
- Separated register success and error messages
- Displayed backend register error messages in frontend
- Simplified backend email validation to require only @
- Added backend login email validation
- Displayed backend login error messages in frontend
- Added inquiry status update success message
- Improved vendor list card details
- Improved customer inquiry date and status display

## Week 10 Review

Completed main workflow polish:

- Vendor search, filter, sort, and result count
- Customer inquiry history and status tracking
- Vendor inquiry filtering, counts, and status updates
- Role-based navbar and protected page links
- Better validation, error messages, and loading/submitting states

## Week 11 Progress

Completed:

- Added responsive layout cleanup for navbar, cards, forms, and detail pages
- Added wider-screen two-column layout for vendor and inquiry lists
- Cleaned unused frontend import
- Completed manual responsive test for main pages
- Added backend environment variable example file
- Added deployment preparation notes

## Week 11 Manual Test Checklist

Test these pages on desktop and mobile width:

- `/vendors` - passed
- `/vendors/:id` - passed
- `/vendor/dashboard` - passed
- `/my-inquiries` - passed
- `/login` - passed
- `/register` - passed

Main workflow test:

- Vendor registers and logs in
- Vendor creates or updates profile
- Vendor adds service details with food type, event type, and available date
- Customer registers and logs in
- Customer filters and sorts vendors
- Customer filters vendors by food type, event type, and available date
- Customer sends inquiry
- Vendor updates inquiry status
- Customer sees updated inquiry status

## Environment Variables

Backend `.env`:

```text
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/eventhub
PORT=3001
```

Use `server/.env.example` as the sample file.
Create the real `server/.env` file locally and put your actual PostgreSQL password there.
Do not share the real `.env` file.

## Deployment Prep

Before deployment:

- Keep backend secrets in environment variables
- Use a hosted PostgreSQL database connection string in production
- Update frontend API URLs if the backend is deployed to a different URL
- Run frontend build before submitting or deploying
- Test login, register, vendor profile, inquiry send, and inquiry status update after deployment

Local verification commands:

```powershell
cd client
npm.cmd run build
```

```powershell
cd server
node --check server.js
```

## Final Demo Flow

Use this flow to demo the main EventHub workflow:

1. Open the app at `http://localhost:5173/vendors`
2. Register a vendor account from `/register`
3. Login with the vendor account
4. Go to `/vendor/dashboard`
5. Create or update the vendor profile
6. Logout
7. Register a customer account from `/register`
8. Login with the customer account
9. Go to `/vendors`
10. Search, filter, or sort vendors
11. Filter vendors by food type, event type, and available date
12. Click one vendor card
13. Send an inquiry with event date and message
14. Logout
15. Login again with the vendor account
16. Go to `/vendor/dashboard`
17. View the received inquiry
18. Change inquiry status to `viewed` or `replied`
19. Logout
20. Login again with the customer account
21. Go to `/my-inquiries`
22. Confirm the inquiry status is updated

Expected result:

- Vendor profile is saved
- Customer inquiry is created
- Vendor can view the inquiry
- Vendor can update inquiry status
- Customer can see updated inquiry status

Optional Version 2 demo:

- Login with the vendor account again
- Go to `/vendor/dashboard`
- Click `Delete Profile`
- Use the in-page confirmation box
- Confirm the profile is removed from `/vendors`

## Tech Stack

- React
- React Router
- Express.js
- PostgreSQL
- CSS

## Main Pages

- `/vendors`
- `/vendors/:id`
- `/vendor/dashboard`
- `/my-inquiries`
- `/login`
- `/register`

## Backend Routes

Vendor routes:

- `GET /api/vendors`
- `GET /api/vendors?location=Chennai&sort=name`
- `GET /api/vendors?foodType=Veg&eventType=Wedding&availableDate=2026-08-20`
- `GET /api/vendors/:id`
- `GET /api/vendors/user/:userId`
- `POST /api/vendors`
- `PUT /api/vendors/:id`
- `DELETE /api/vendors/:id`

Vendor service routes:

- `POST /api/vendor-services`
- `POST /api/vendor-services/range`
- `GET /api/vendor-services/:vendorId`
- `GET /api/vendor-availability/:vendorId`
- `GET /api/vendor-booked-dates/:vendorId`
- `PUT /api/vendor-booked-dates/:vendorId`

Inquiry routes:

- `POST /api/inquiries`
- `GET /api/inquiries/vendor/:vendorId`
- `GET /api/inquiries/customer/:customerId`
- `PUT /api/inquiries/:id/status`

Auth routes:

- `POST /api/auth/register`
- `POST /api/auth/login`

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

## Known Limitations

- Passwords are stored as plain text for learning checkpoint only.
- No JWT token yet.
- Vendor dashboard uses localStorage user data.
- Deployment is not done yet.

## Future Improvements

These features are planned for future versions, but they are outside the current MVP scope:

- Add password hashing for better security
- Add JWT-based authentication
- Add vendor categories and service type filters
- Add vendor images or portfolio photos
- Add admin panel to manage users and vendors
- Add email notifications for new inquiries
- Deploy frontend, backend, and PostgreSQL database

## Version 2 Progress

Started after MVP completion:

- Added backend route to delete a vendor profile
- Delete vendor route also removes inquiries for that vendor
- Added delete profile button in vendor dashboard
- Added vendor service table for food type, event type, and availability
- Added backend route to add vendor service details
- Added backend route to get services by vendor id
- Added vendor dashboard service form with food type, event type, and available date
- Added saved services list in vendor dashboard
- Added vendor list filters for food type, event type, and available date
- Added vendor availability date range saving
- Booked inquiry dates stay unavailable when saving availability ranges
- Added customer-side availability calendar that shows booked dates as disabled
- Backend prevents inquiries on booked or unavailable dates
- Changed availability behavior so all dates are available by default
- Added multi-date booked/unbooked calendar toggles for vendors
- Saved only booked dates in the `vendor_booked_dates` table
- Customer calendar now treats every non-booked date as available
- Added food type, event type, and available date fields to vendor profile
- Vendor cards now show food type, event type, and available date
- Applied final UI polish for navbar, filters, cards, forms, buttons, and responsive layout
- Added animated wave hero design on the main vendor page
- Added showcase-style dark vendor cards with icon, visual area, gradient title, and view details action
- Improved filter accessibility labels
- Improved login/register form autocomplete
- Improved long text wrapping for vendor names, details, and inquiry cards
- Improved mobile calendar controls for small screens
- Normalized vendor profile text fields to uppercase for cleaner display

## Version 2 Demo Flow

Use this flow to demo the delete vendor profile feature:

1. Login with a vendor account
2. Go to `/vendor/dashboard`
3. Make sure the vendor profile already exists
4. Click `Delete Profile`
5. Review the confirmation box shown inside the page
6. Click `Cancel` to stop deletion, or `Yes, Delete` to confirm
7. After delete, confirm the success message is shown
8. Go to `/vendors`
9. Confirm the deleted vendor profile is no longer listed

Expected result:

- Vendor profile is deleted
- Related vendor inquiries are removed
- Vendor dashboard changes back to create profile state
- Vendor list no longer shows the deleted profile

## MVP Scope Note

This version focuses on the main EventHub workflow:

- Vendors can create and update their profile
- Customers can search vendors and send inquiries
- Vendors can view and update inquiry status
- Customers can track their sent inquiries

Advanced features like payments, live chat, ratings, and admin approval are not included in this MVP.
#   E V E N T H U B  
 