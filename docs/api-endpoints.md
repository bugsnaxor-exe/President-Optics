# API Endpoints Documentation

This document outlines the API endpoints that need to be implemented in the backend for the Smart Optical Management System.

All endpoints are currently implemented as Next.js API routes returning mock data. They should be converted to backend API endpoints.

## Endpoints

### Admin Payment Notices
- **GET** `/api/admin-payment-notices`
  - Returns: List of admin payment notices
  - Mock data source: `adminPaymentNotices` from `@/lib/data`

### Admins
- **GET** `/api/admins`
  - Returns: List of admins
  - Mock data source: `admins` from `@/lib/data`

### Appointments
- **GET** `/api/appointments`
  - Returns: List of appointments
  - Mock data source: `appointments` from `@/lib/data`

### Doctors
- **GET** `/api/doctors`
  - Returns: List of doctors
  - Mock data source: `doctors` from `@/lib/data`

### Invoices
- **GET** `/api/invoices`
  - Returns: List of invoices
  - Mock data source: `invoices` from `@/lib/data`

### Patients
- **GET** `/api/patients`
  - Returns: List of patients
  - Mock data source: `patients` from `@/lib/data`

### Products
- **GET** `/api/products`
  - Returns: List of products
  - Mock data source: `products` from `@/lib/data`

### Purchase Orders
- **GET** `/api/purchase-orders`
  - Returns: List of purchase orders
  - Mock data source: `purchaseOrders` from `@/lib/data`

### Shops
- **GET** `/api/shops`
  - Returns: List of shops
  - Mock data source: `shops` from `@/lib/data`

### Staff
- **GET** `/api/staff`
  - Returns: List of staff
  - Mock data: Hardcoded array `[{ name: 'Raj Patel', email: 'staff@example.com', lastLogin: '2024-05-20 10:00 AM' }]`

## Notes
- All endpoints currently return JSON data.
- In the backend implementation, replace mock data with actual database queries.
- Consider adding authentication and authorization as needed.
- Add POST, PUT, DELETE methods for CRUD operations if required by the frontend.