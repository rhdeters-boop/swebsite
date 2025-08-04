# Void of Desire - Creator Platform

A full-stack creator platform for hosting and selling access to premium pictures and videos with tiered subscriptions, secure payments, and media management.

## 🌟 Features

### User Features
- **Account Creation & Authentication** - Secure user registration and login
- **Tiered Subscription System** - Three subscription levels with different content access
- **Secure Payment Processing** - Stripe integration for subscriptions and tips
- **Media Galleries** - Access to premium photo and video content based on subscription tier
- **User Dashboard** - Manage subscriptions, view billing history, and update profile
- **Mobile Responsive** - Dark void theme optimized for all devices

### Subscription Tiers
1. **Picture Tier** ($9.99/month) - Access to premium photo galleries
2. **Solo Video Tier** ($19.99/month) - Pictures + solo video content  
3. **Collab Video Tier** ($29.99/month) - All content including collaborative videos

### Technical Features
- **Secure Media Hosting** - AWS S3 with signed URLs for content protection
- **Authentication** - JWT tokens with secure session management
- **Payment Processing** - Stripe for recurring subscriptions and creator payouts
- **Real-time Updates** - TanStack Query for efficient server state management
- **Type Safety** - Full TypeScript implementation

## 🛠️ Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for fast development and building
- **TailwindCSS** for styling with custom void theme
- **TanStack Query** for server state management
- **React Router** for navigation
- **Stripe Elements** for payment forms
- **Lucide React** for icons

### Backend
- **Node.js** with Express.js
- **PostgreSQL** database with Sequelize ORM
- **JWT** for authentication
- **Stripe** for payment processing
- **AWS S3** for media storage
- **bcryptjs** for password hashing
- **Express Rate Limiting** for security

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Stripe account
- AWS S3 bucket (for media hosting)
- Auth0 account (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd swebsite
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

4. **Environment Setup**
   
   **Frontend (.env)**
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
   VITE_AUTH0_DOMAIN=your-domain.auth0.com
   VITE_AUTH0_CLIENT_ID=your_auth0_client_id
   ```

   **Backend (backend/.env)**
   ```env
   PORT=5000
   NODE_ENV=development
   
   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=premium_media_db
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   
   # JWT Secret
   JWT_SECRET=your_super_secret_jwt_key
   
   # Stripe
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   
   # AWS S3
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   AWS_REGION=us-west-2
   S3_BUCKET_NAME=your-media-bucket
   
   # Frontend URL
   FRONTEND_URL=http://localhost:5173
   ```

5. **Database Setup**
   ```bash
   # Create PostgreSQL database
   createdb premium_media_db
   ```

6. **Start Development Servers**
   
   **Frontend** (runs on port 5173)
   ```bash
   npm run dev
   ```
   
   **Backend** (runs on port 5000)
   ```bash
   cd backend
   npm run dev
   ```

## 📁 Project Structure

```
swebsite/
├── src/                    # Frontend React application
│   ├── components/         # Reusable React components
│   ├── pages/             # Page components
│   ├── context/           # React context providers
│   └── utils/             # Utility functions
├── backend/               # Backend API server
│   ├── config/            # Database and other configurations
│   ├── middleware/        # Express middleware
│   ├── models/            # Sequelize database models
│   ├── routes/            # API route handlers
│   └── server.js          # Main server file
├── public/                # Static assets
└── package.json           # Project dependencies
```

## 🎨 Design System

The application uses a custom pink girly theme with:
- **Primary Color**: `#ec4899` (brand-pink)
- **Secondary Colors**: Pink palette from 50 to 900
- **Typography**: Inter font family
- **Components**: Custom styled with TailwindCSS
- **Animations**: Smooth transitions and hover effects

## 💳 Payment Integration

### Subscription Management
- Recurring monthly billing through Stripe
- Automatic subscription tier management
- Proration for plan upgrades/downgrades
- Secure payment method storage

### Tip System
- One-time payments for additional support
- Minimum $0.50 tip amount
- Instant payment processing

## 🔐 Security Features

- **JWT Authentication** with secure token storage
- **Password Hashing** using bcryptjs
- **Rate Limiting** to prevent abuse
- **CORS Protection** for cross-origin requests
- **Input Validation** using express-validator
- **Secure Headers** with Helmet.js
- **Media Access Control** with signed S3 URLs

## 🚀 Deployment

### Frontend (Vercel/Netlify)
1. Build the application: `npm run build`
2. Deploy the `dist` folder to your hosting platform
3. Configure environment variables

### Backend (Railway/Heroku/AWS)
1. Set up PostgreSQL database
2. Configure environment variables
3. Deploy backend server
4. Set up Stripe webhooks

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Subscriptions
- `GET /api/subscriptions/current` - Get current subscription
- `GET /api/subscriptions/history` - Get subscription history

### Media
- `GET /api/media/gallery` - Get accessible media
- `GET /api/media/gallery/:tier` - Get media by tier

### Payments
- `POST /api/payments/tips` - Create tip payment
- `GET /api/payments/history` - Get payment history
- `POST /api/payments/webhooks/stripe` - Stripe webhook

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 💬 Support

For support, please contact [your-email@example.com] or create an issue in the repository.
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
