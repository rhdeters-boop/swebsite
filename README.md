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
- Docker and Docker Compose
- PostgreSQL database (provided via Docker)
- MinIO for S3-compatible storage (provided via Docker)
- Stripe account
- AWS S3 bucket (for media hosting)
- Auth0 account (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd swebsite
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd backend && npm install && cd ..
   ```

3. **Start development services (PostgreSQL, MinIO, Redis)**
   ```bash
   # Quick setup with script
   ./scripts/setup-minio.sh
   
   # Or manually
   npm run dev:services
   ```

4. **Environment Setup**
   ```bash
   cp backend/.env.example backend/.env
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

### Quick Development Setup

For a complete local development environment:

```bash
# Clone and setup
git clone <repository-url>
cd swebsite
npm install

# Start all services and development servers
npm run dev:full
```

This will start:
- PostgreSQL database (localhost:5432)
- MinIO S3-compatible storage (localhost:9000)
- Redis cache (localhost:6379)
- Backend API server (localhost:5000)
- Frontend development server (localhost:5173)

### Manual Setup

If you prefer to set up services individually:

1. **Install dependencies**
   ```bash
   npm install
   cd backend && npm install && cd ..
   ```

2. **Set up environment variables**
   
   **Frontend (.env)**
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
   ```

   **Backend (backend/.env)**
   ```env
   PORT=5000
   NODE_ENV=development
   
   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=swebsite_dev
   DB_USER=postgres
   DB_PASSWORD=password
   
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
   
   **All services and servers** (recommended)
   ```bash
   npm run dev:full
   ```
   
   **Just application servers**
   ```bash
   npm run dev
   ```
   
   **Individual services**
   ```bash
   # Start MinIO, PostgreSQL, Redis
   npm run dev:services
   
   # Start frontend only (port 5173)
   npm run dev:frontend
   
   # Start backend only (port 5000)  
   npm run dev:backend
   
   # Stop all services
   npm run stop:services
   ```

## 🗄️ Local Development Services

- **MinIO Console:** http://localhost:9001 (minioadmin/minioadmin123)
- **MinIO API:** http://localhost:9000
- **PostgreSQL:** localhost:5432 (postgres/password)
- **Redis:** localhost:6379
- **Backend API:** http://localhost:5000
- **Frontend:** http://localhost:5173

See [MinIO Setup Guide](./docs/MINIO_SETUP.md) for detailed information.

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
