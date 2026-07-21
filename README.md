# Winkit - Instant Grocery Delivery App

Winkit is a modern, full-stack grocery delivery application offering a seamless shopping experience with real-time updates and a beautiful UI. 

## 🚀 Features

- **User Authentication**: Secure JWT-based authentication (HTTP-only cookies) with email verification and password reset flows.
- **Product Catalog**: Dynamic, search-optimized product listing and robust category/subcategory management.
- **Guest Cart & Sync**: Add items to your cart without logging in; automatically syncs to your account upon login.
- **Real-Time Orders**: WebSockets (Socket.io) used for real-time order tracking and status updates from Admin to Customer.
- **Admin Dashboard**: Full CRUD interface for managing inventory, categories, and orders.
- **Responsive Design**: Mobile-first architecture, highly optimized for all screen sizes.

## 💻 Tech Stack

**Frontend:**
- React (Vite)
- Redux Toolkit (State Management)
- Tailwind CSS
- React Router DOM
- Axios
- Socket.io-client

**Backend:**
- Node.js & Express
- PostgreSQL (via `pg` pool)
- JSON Web Tokens (JWT) & bcryptjs
- Socket.io
- Multer & Cloudinary (Image handling)
- Winston (Logging)

## 🛠️ Setup Instructions

1. **Clone the repository**
2. **Setup PostgreSQL**: Create a database named `winkit` and run the DDL schema to set up tables.
3. **Environment Variables**:
   - `server/.env`: Include `PG_USER`, `PG_PASSWORD`, `PG_DATABASE`, `JWT_SECRET`, `CLOUDINARY_URL`, etc.
   - `client/.env`: Include `VITE_API_URL` pointing to the backend.
4. **Install Dependencies**:
   - Backend: `cd server && npm install`
   - Frontend: `cd client && npm install`
5. **Run Locally**:
   - Backend: `npm run dev`
   - Frontend: `npm run dev`
