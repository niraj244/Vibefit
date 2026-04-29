# Vibefit:Your confidence matters - CS4800 Project

**Authors:** Alisha Pokharel & Niraj Tamang  
**Course:** CS4800  

## Overview
This project is a fully functional backend for an e-commerce platform built using **Node.js**, **Express.js**, and **MongoDB**. It provides RESTful APIs for managing users, products, categories, carts, orders, banners, logos, reviews, addresses, and payment integrations (PayPal & eSewa). The system supports authentication, authorization, email verification, and image uploads with **Cloudinary**.  

---

## Features

### User Management
- User registration, login, logout.
- Email verification via OTP.
- Google authentication support.
- Password reset and change.
- Update user profile and avatar (Cloudinary integrated).
- Role-based access: ADMIN and USER.
- Fetch all users with pagination.
- Add, fetch, and delete multiple users.

### Product Management
- CRUD operations on products.
- Upload product and banner images via Cloudinary.
- Product categorization with multiple category levels.
- Filter, sort, and search products.
- Manage product sizes and cleanup invalid sizes.
- Fetch products by category, subcategory, price, rating, and featured products.
- Delete multiple products at once.

### Category Management
- CRUD operations on categories and subcategories.
- Upload category images via Cloudinary.
- Fetch category counts and subcategory counts.

### Cart & Wishlist
- Add, update, and remove items from the cart.
- Empty cart functionality.
- Add and delete items from wishlist (`MyList`).

### Orders
- Create orders with multiple payment options (PayPal & eSewa).
- Capture and verify payments.
- Update order status.
- Fetch order details for users and admins.
- Email notifications with order confirmation.

### Addresses
- Add, update, delete, and fetch user addresses.
- Manage multiple addresses per user.

### Banners & Home Slides
- Manage banners (`bannerV1`, `bannerList2`) and home slides.
- Upload and delete images via Cloudinary.

### Logo
- Add, update, and fetch site logo.
- Upload and delete images via Cloudinary.

### Reviews
- Add and fetch product reviews.
- Get all reviews across the platform.

---

## Tech Stack
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** JWT (Access & Refresh Tokens)
- **Email Service:** Nodemailer
- **Image Storage:** Cloudinary
- **Payment Integrations:** PayPal, eSewa
- **Middlewares:** Helmet, Cors, Cookie-Parser, Multer
- **Environment Variables:** `.env` file  

---

## Installation

1. unzip the file
2. go to respective folders using "cd". for example: cd client, cd server, cd admin
3. use "npm install" inside the respective folders (client, server, admin)
4. use "npm run dev" inside the respective folders (client, server, admin)
