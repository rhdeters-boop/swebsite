# Project Context: Void of Desire

This document provides a comprehensive overview of the Void of Desire creator platform, designed to enable rapid understanding for agentic AIs.

## 1. Project Overview

**Purpose:** A full-stack creator platform for hosting and selling access to premium pictures and videos with tiered subscriptions, secure payments, and media management.

**Main Features:**
-   **User Features:** Account creation, tiered subscriptions, secure payments (Stripe), media galleries, and a user dashboard.
-   **Creator Features:** Media uploading, analytics dashboard, and profile management.
-   **Technical Features:** Flexible media storage (Azure Blob Storage/MinIO), secure media hosting with signed URLs, JWT authentication, and a type-safe codebase (TypeScript).

### Subscription Tiers:
-   **Picture Tier ($9.99/month):** Access to premium photo galleries.
-   **Solo Video Tier ($19.99/month):** All picture tier content plus solo video content.
-   **Collab Video Tier ($29.99/month):** All content, including collaborative videos.

## 2. Technology Stack

### Frontend
-   **Framework:** React 19 with TypeScript
-   **Build Tool:** Vite
-   **Styling:** TailwindCSS with a custom "void" theme
-   **State Management:** TanStack Query for server state
-   **Routing:** React Router
-   **Payments:** Stripe Elements
-   **Icons:** Lucide React

### Backend
-   **Framework:** Node.js with Express.js
-   **Database:** PostgreSQL with Sequelize ORM
-   **Media Storage:** Azure Blob Storage (production) or MinIO/S3 (development)
-   **Authentication:** JSON Web Tokens (JWT)
-   **Payments:** Stripe
-   **Security:** bcryptjs for password hashing, express-rate-limit for security.

## 3. Directory Structure & Critical Files

```
swebsite/
├── src/                    # Frontend React application
│   ├── components/         # Reusable React components
│   ├── pages/              # Page components
│   ├── context/            # React context providers
│   ├── App.tsx             # Main application component and router setup
│   └── ...
├── backend/                # Backend API server
│   ├── config/             # Database and other configurations
│   ├── middleware/         # Express middleware (auth, error handling)
│   ├── models/             # Sequelize database models
│   ├── routes/             # API route handlers
│   ├── services/           # Business logic
│   ├── app.ts              # Express application setup
│   └── server.js           # Main server entry point
├── public/                 # Static assets
└── package.json            # Project dependencies and scripts
```

**Critical Files:**
-   **`swebsite/package.json`**: Defines frontend dependencies and scripts for running the entire project.
-   **`swebsite/backend/package.json`**: Defines backend dependencies and scripts.
-   **`swebsite/src/App.tsx`**: The main entry point for the React frontend, containing the application's routing and layout structure.
-   **`swebsite/backend/app.ts`**: Configures the Express application, including middleware and route setup.
-   **`swebsite/backend/server.js`**: The entry point for the backend server.
-   **`swebsite/docker-compose.dev.yml`**: Defines the development services (PostgreSQL, MinIO).

## 4. API Endpoints

### Analytics (`/api/analytics`)
-   `POST /views/:mediaId`: Record a view for a media item.
-   `POST /likes/:mediaId`: Record a like for a media item.
-   `POST /shares/:mediaId`: Record a share for a media item.
-   `GET /media/:mediaId`: Get analytics for a specific media item.
-   `GET /dashboard`: Get dashboard analytics for a creator.
-   `GET /creator`: Get creator analytics for a date range.
-   `GET /top-performing`: Get top-performing media for a creator.

### Authentication (`/api/auth`)
-   `GET /check-username/:username`: Check if a username is available.
-   `POST /register`: Register a new user.
-   `POST /login`: Log in a user.
-   `GET /me`: Get the current user's information.
-   `POST /forgot-password`: Request a password reset.
-   `POST /reset-password`: Reset a password with a token.
-   `GET /verify-reset-token/:token`: Verify a password reset token.
-   `PUT /profile`: Update the user's profile.
-   `PUT /change-password`: Change the user's password.
-   `PUT /change-email`: Change the user's email.
-   `GET /account-info`: Get user account information.
-   `PUT /notification-settings`: Update notification settings.
-   `PUT /security-settings`: Update security settings.
-   `DELETE /delete-account`: Delete the user's account.

### Billing (`/api/billing`)
-   `GET /subscriptions`: Get current and past subscriptions.
-   `POST /subscriptions/:id/cancel`: Cancel a subscription.
-   `GET /history`: Get billing history.
-   `POST /refund-request`: Create a refund request.
-   `GET /payment-methods`: Get saved payment methods.
-   `POST /payment-methods`: Create a setup intent to add a new payment method.
-   `DELETE /payment-methods/:id`: Delete a saved payment method.

### Creator Profile (`/api/creator-profile`)
-   `POST /profile`: Create a creator profile.
-   `PUT /profile`: Update a creator profile.

### Creators (`/api/creators`)
-   `GET /`: Get all creators with search and filters.
-   `GET /top-performers`: Get top-performing creators.
-   `GET /trending`: Get trending creators.
-   `GET /new-rising`: Get new and rising creators.
-   `GET /username/:username`: Get a creator by username.
-   `GET /:id`: Get a creator by ID.
-   `POST /apply`: Apply to become a creator.
-   `GET /me/profile`: Get the current user's creator profile.
-   `PUT /me/profile`: Update the current user's creator profile.
-   `GET /user/:userId`: Get a creator profile by user ID.
-   `PUT /profile`: Update a creator profile.
-   `POST /:id/follow`: Follow/unfollow a creator.

### Health (`/api/health`)
-   `GET /health`: Check the health of the application and its services.
-   `GET /s3`: Check the health of the S3 service.
-   `GET /test-s3`: Test the S3 storage functionality.

### Likes (`/api/likes`)
-   `GET /:creatorId/likes`: Get like counts for a creator.
--  `POST /:creatorId/like`: Like or dislike a creator.
-   `DELETE /:creatorId/like`: Remove a like or dislike from a creator.

### Media (`/api/media`)
-   `GET /gallery/:tier`: Get media by subscription tier.
-   `GET /gallery`: Get all accessible media for a user.
-   `POST /upload`: Upload a media file.
-   `POST /profile/upload-url`: Get a presigned URL for profile image uploads.
-   `POST /upload-url`: Get a presigned URL for direct media uploads.
-   `GET /:id`: Get a single media item.
-   `PUT /:id`: Update a media item.
-   `DELETE /:id`: Delete a media item.
-   `GET /creator/:creatorId`: Get media by creator.
-   `GET /analytics/:creatorId`: Get media analytics for a creator.
-   `POST /create-record`: Create a media record after an S3 upload.

### Notifications (`/api/notifications`)
-   `GET /`: Get notifications for the authenticated user.
-   `GET /settings`: Get notification settings.
-   `PUT /settings`: Update notification settings.
-   `POST /:id/read`: Mark a single notification as read.
-   `POST /read-all`: Mark all notifications as read.

### Payments (`/api/payments`)
-   `POST /tips`: Create a payment intent for a tip.
-   `POST /subscription`: Create a subscription payment intent.
-   `GET /history`: Get payment history.
-   `GET /analytics/:creatorId`: Get creator payment analytics.
-   `POST /subscription/:subscriptionId/cancel`: Cancel a subscription.
-   `POST /setup-intent`: Create a setup intent for saving a payment method.
-   `GET /payment-methods`: Get payment methods.
-   `DELETE /payment-methods/:paymentMethodId`: Delete a payment method.
-   `POST /webhooks/stripe`: Handle Stripe webhooks.

### Subscriptions (`/api/subscriptions`)
-   `GET /current`: Get the user's current subscription.
-   `GET /history`: Get the user's subscription history.
-   `POST /create`: Create a new subscription.
-   `PUT /:id`: Update a subscription.
-   `POST /cancel`: Cancel a subscription.
-   `POST /reactivate`: Reactivate a subscription.
-   `GET /creator/:creatorId/subscribers`: Get a creator's subscribers.
-   `POST /creator/:creatorId/subscribe`: Subscribe to a creator.
-   `DELETE /creator/:creatorId/unsubscribe`: Unsubscribe from a creator.
-   `GET /my-creators`: Get the user's creator subscriptions.
-   `GET /check-access/:tier`: Check if the user has access to a specific tier.
-   `GET /analytics/:creatorId`: Get subscription analytics for a creator.

### Users (`/api/users`)
-   `GET /`: Get all users.
-   `GET /profile`: Get the user's profile.
-   `PUT /profile`: Update the user's profile.
-   `GET /username/:username`: Get a user by username.
-   `GET /stats`: Get user statistics.
-   `POST /deactivate`: Deactivate the user's account.
-   `POST /reactivate`: Reactivate the user's account.

## 5. Data Flow & Design Patterns

-   **Client-Server Architecture:** The frontend is a single-page application (SPA) that communicates with the backend via a RESTful API.
-   **Service Layer:** The backend uses a service layer to separate business logic from the route handlers. This promotes code reuse and separation of concerns.
-   **Model-View-Controller (MVC) like pattern:** The backend is organized in a way that resembles MVC, with models (Sequelize), routes (controllers), and services (business logic).
-   **Asynchronous Operations:** The application makes extensive use of `async/await` for handling asynchronous operations, particularly for database queries and API calls.
-   **Environment-based Configuration:** The application uses environment variables for configuration, allowing for different settings in development and production.
-   **Dependency Injection (manual):** Services are manually imported into the route files, which is a form of manual dependency injection.