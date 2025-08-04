<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Premium Media Subscription Platform

This is a full-stack subscription-based web application for hosting and selling access to premium pictures and videos.

## Tech Stack
- **Frontend**: React 19 + TypeScript + Vite + TailwindCSS
- **Backend**: Node.js + Express + PostgreSQL + Sequelize
- **Authentication**: Custom JWT + Auth0 integration
- **Payments**: Stripe for subscriptions and tips
- **Media**: AWS S3 for secure media hosting
- **State Management**: TanStack Query for server state

## Architecture
- Frontend runs on port 5173 (Vite dev server)
- Backend API runs on port 5000
- PostgreSQL database for user data, subscriptions, and media metadata
- S3 bucket for secure media storage with signed URLs

## Subscription Tiers
1. **Picture Tier** ($9.99/month) - Access to premium photo galleries
2. **Solo Video Tier** ($19.99/month) - Pictures + solo video content  
3. **Collab Video Tier** ($29.99/month) - All content including collaborative videos

## Key Features
- Tiered subscription system with Stripe integration
- Secure media delivery with signed URLs
- User dashboard for subscription management
- "Send a Tip" feature for additional payments
- Mobile-responsive pink girly theme
- Auth0 integration with password interception

## Code Style
- Use TypeScript for type safety
- Follow React hooks patterns
- Use TailwindCSS with custom pink theme
- Implement proper error handling and loading states
- Use TanStack Query for all API calls
- Follow REST API conventions for backend routes
