# EventHub - Event Management Vendor Finder POC

## Project Name

EventHub / Event Management Platform

## Problem Statement

People need event management teams for weddings, birthdays, corporate events, and other functions. But each vendor has a separate website or contact method, so customers must search and contact vendors one by one.

EventHub solves this problem by bringing many event management vendors into one common platform. Customers can search, filter, view details, and contact vendors from one place.

## Target Users

### 1. Customer / User

Customers can:

- View available event vendors
- Filter vendors by location, food type, event type, and date availability
- Open a vendor detail page
- See contact number, services, price range, and work details
- Send an inquiry to a vendor

### 2. Vendor / Event Management Team

Vendors can:

- Create an account
- Add their vendor profile
- Update their vendor profile
- Manage service details
- Manage availability
- View customer inquiries

## Core Idea

The main idea is to create a common platform where customers can find event management teams easily. Instead of visiting separate vendor websites, users can compare vendors in one place.

## MVP Features

### 1. Authentication

- Customer registration and login
- Vendor registration and login
- Role-based behavior for customer and vendor

### 2. Vendor Listing Page

The vendor listing page shows all available vendors.

Customers can filter vendors by:

- Location
- Food type: veg, non-veg, vegan
- Event type: wedding, birthday, corporate, etc.
- Available date

### 3. Vendor Detail Page

Each vendor detail page shows:

- Vendor name
- Location
- Contact number
- Food type
- Event types handled
- Description / work details
- Price range
- Availability

### 4. Vendor Dashboard

Vendors can:

- Create their vendor profile
- Update their vendor profile
- Edit service details
- Edit availability details

### 5. Basic Inquiry Feature

Customers can send an inquiry/request to a vendor.

Vendors can view the inquiries they received.

## Database Tables

### users

Stores login and role information.

Example fields:

- id
- name
- email
- password_hash
- role
- created_at

### vendors

Stores vendor profile information.

Example fields:

- id
- user_id
- business_name
- location
- contact_number
- description
- price_range
- created_at

### vendor_services

Stores services offered by each vendor.

Example fields:

- id
- vendor_id
- event_type
- food_type
- available_date

### inquiries

Stores customer inquiries sent to vendors.

Example fields:

- id
- customer_id
- vendor_id
- event_date
- message
- status
- created_at

## Pages Needed

- `/login`
- `/register`
- `/vendors`
- `/vendors/:id`
- `/vendor/dashboard`
- `/my-inquiries`

## Backend API Routes

### Auth Routes

- `POST /api/auth/register`
- `POST /api/auth/login`

### Vendor Routes

- `GET /api/vendors`
- `GET /api/vendors/:id`
- `POST /api/vendors`
- `PUT /api/vendors/:id`

### Inquiry Routes

- `POST /api/inquiries`
- `GET /api/inquiries/vendor`
- `GET /api/inquiries/customer`

## Tech Stack

### Frontend

- React.js
- React Router
- CSS

### Backend

- Express.js
- Node.js

### Database

- PostgreSQL

## First Version Scope

The first version will focus only on the core workflow:

1. Customer registers/logs in
2. Vendor registers/logs in
3. Vendor creates a profile
4. Customer views vendor list
5. Customer filters vendors
6. Customer opens vendor detail page
7. Customer sends an inquiry
8. Vendor views received inquiries

## Not Included In First Version

These features are future improvements and will not be added in the first version:

- Online payment
- Live chat
- Real email or SMS sending
- Complex admin panel
- Rating system
- Advanced recommendation system

## Why This Project Is Suitable For Final Capstone

This project is suitable for the final capstone because it has:

- A real-world problem
- Two clear user roles
- Authentication
- Role-based behavior
- CRUD operations
- PostgreSQL database relationships
- Search and filter features
- React frontend pages
- Express backend API routes
- A complete main workflow from vendor discovery to customer inquiry

## Mentor Approval Summary

EventHub is an event management vendor finder platform. It connects customers with multiple event management vendors in one place. Customers can search and filter vendors based on location, food type, event type, and availability. Vendors can create and manage their own profiles. The project uses React for the frontend, Express.js for the backend, PostgreSQL for the database, authentication, role-based user behavior, CRUD operations, and filtering.

The first version will focus on vendor discovery, vendor details, vendor dashboard, and customer inquiries.
