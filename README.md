# GroceryStore

A modern, full-stack e-commerce application for grocery shopping with location-based services and real-time updates.

---

## Overview

GroceryStore is a MERN-based (MongoDB, Express, React, Node.js) web application designed to provide an intuitive and seamless online grocery shopping experience. The platform helps users browse, search, and purchase groceries with features like location-based store discovery, user authentication, and an efficient order management system.

---

## Features

- 🛒 **Product Browsing & Search** - Browse grocery products with advanced filtering and search capabilities
- 📍 **Location-Based Store Discovery** - Find nearby stores using Leaflet maps integration
- 👤 **User Authentication** - Secure login and registration with JWT tokens
- 🛍️ **Shopping Cart & Checkout** - Manage cart items and complete purchases
- 📧 **Email Notifications** - Order confirmations and updates via email
- 💳 **Payment Processing** - Secure payment integration
- 🖼️ **Image Management** - Upload and manage product images via Cloudinary
- 📱 **Responsive Design** - Mobile-friendly interface with Tailwind CSS
- 🔄 **Real-time Updates** - Background jobs and task scheduling with Inngest
- 🗂️ **Database Management** - Efficient data handling with Prisma ORM

---

## Tech Stack

### Frontend
- **React 19** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router DOM** - Client-side routing
- **Leaflet & React Leaflet** - Interactive maps
- **Swiper** - Carousel/slider component
- **React Hot Toast** - Toast notifications
- **Lucide React** - Icon library
- **ESLint** - Code quality

### Backend
- **Node.js & Express** - Server framework
- **TypeScript** - Type-safe JavaScript
- **Prisma** - ORM with PostgreSQL (Neon adapter)
- **PostgreSQL** - Database
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing
- **Cloudinary** - Image hosting and management
- **Nodemailer** - Email service
- **Multer** - File upload handling
- **Inngest** - Background jobs and workflows
- **CORS** - Cross-origin requests

---

## System Architecture

```
GroceryStore
├── Frontend (React + TypeScript)
│   └── Communicates with Backend API
│
└── Backend (Node.js + Express + TypeScript)
    ├── API Endpoints
    ├── Authentication (JWT + Bcrypt)
    ├── Database (Prisma + PostgreSQL)
    ├── File Storage (Cloudinary)
    ├── Email Service (Nodemailer)
    └── Background Jobs (Inngest)
```

**Data Flow:**
1. User interacts with React frontend
2. Frontend sends HTTP requests to Express backend
3. Backend processes requests and queries PostgreSQL via Prisma
4. Backend integrates with external services (Cloudinary, Nodemailer, Inngest)
5. Frontend receives responses and updates UI

---

## Project Structure

```
GroceryStore/
├── client/                      # React Frontend
│   ├── src/
│   │   ├── components/         # Reusable React components
│   │   ├── pages/              # Page components
│   │   ├── hooks/              # Custom React hooks
│   │   ├── services/           # API service calls
│   │   ├── utils/              # Utility functions
│   │   ├── types/              # TypeScript types
│   │   ├── App.tsx             # Root component
│   │   └── main.tsx            # Entry point
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.ts
│
├── server/                      # Express Backend
│   ├── src/
│   │   ├── routes/             # API route handlers
│   │   ├── controllers/        # Request handlers
│   │   ├── services/           # Business logic
│   │   ├── middleware/         # Express middleware
│   │   ├── utils/              # Utility functions
│   │   ├── types/              # TypeScript types
│   │   ├── prisma/             # Database schema
│   │   │   └── schema.prisma  # Prisma schema definition
│   │   └── server.ts           # Server entry point
│   ├── seed.ts                 # Database seeding script
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example            # Environment variables template
│
└── README.md                    # This file
```

---

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- Cloudinary account (for image hosting)
- SMTP service (for email notifications)

### Backend Setup
```bash
cd server
npm install
npm run seed          # Seed database with initial data
npm run dev          # Start development server
```

### Frontend Setup
```bash
cd client
npm install
npm run dev          # Start development server
```

---

## Environment Variables

Create `.env` file in the server directory with:
```
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
SMTP_USER=your_smtp_email
SMTP_PASSWORD=your_smtp_password
```

---

## Available Scripts

### Backend
- `npm run dev` - Start development server with auto-reload
- `npm start` - Run production server
- `npm run build` - Compile TypeScript
- `npm run seed` - Populate database with initial data

### Frontend
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

---

## License
This project only serve for learning or portfolio purpose



