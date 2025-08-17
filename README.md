# Alumni Community Platform

A full-stack alumni community platform built with React, Express, and MongoDB. The platform enables alumni to share stories through blogs, register for events, connect with staff members, and engage with the community.

## Features

- **User Authentication**: Session-based authentication with role-based access control
- **Blog Management**: Create, edit, and publish blog posts with media attachments
- **Event Management**: Create and manage community events with announcements
- **Staff Directory**: Manage staff profiles and organizational information
- **Admin Dashboard**: Comprehensive admin interface for content and user management
- **Media Upload**: Cloudinary integration for images, videos, and documents
- **Mobile Responsive**: Optimized for mobile and desktop experiences

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling with responsive design
- **Radix UI** components with shadcn/ui
- **TanStack Query** for server state management
- **Wouter** for lightweight routing
- **React Hook Form** with Zod validation

### Backend
- **Express.js** with TypeScript
- **MongoDB** with Mongoose ODM
- **Passport.js** for authentication
- **Cloudinary** for media storage
- **Multer** for file uploads

## Prerequisites

- Node.js 18+ and npm
- MongoDB database (local or MongoDB Atlas)
- Cloudinary account for media storage

## Local Development Setup

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd alumni-platform
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```env
# Database
MONGODB_URL=mongodb://localhost:27017/alumni-platform
# Or for MongoDB Atlas:
# MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/alumni-platform

# Cloudinary (for file uploads)
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name

# Session Secret (generate a random string)
SESSION_SECRET=your-super-secret-session-key-here

# Environment
NODE_ENV=development
```

### 3. Database Setup

If using local MongoDB:
```bash
# Install MongoDB locally or use MongoDB Atlas
# The application will automatically create collections and seed a super admin account
```

### 4. Start Development Server

```bash
npm run dev
```

This will start both the Express server (port 5000) and Vite development server with hot reload.

### 5. Default Admin Account

The application creates a default super admin account:
- **Email**: superadmin@ikaram.edu
- **Password**: SuperAdmin123!

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - TypeScript type checking
- `npm run db:push` - Push database schema changes (if using Drizzle)

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages/routes
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions and configurations
│   │   └── index.css       # Global styles and Tailwind
│   └── public/             # Static assets
├── server/                 # Backend Express application
│   ├── auth.ts            # Authentication middleware
│   ├── routes.ts          # API routes
│   ├── mongodb-storage.ts # Database operations
│   ├── cloudinary-config.ts # Media upload configuration
│   └── index.ts           # Server entry point
├── shared/                 # Shared types and schemas
│   └── mongodb-schema.ts  # Database schemas and TypeScript types
└── package.json           # Dependencies and scripts
```

## Deployment

### Option 1: Replit Deployment (Recommended)

1. The application is optimized for Replit deployment
2. Set environment variables in Replit Secrets
3. Click "Deploy" in your Replit workspace

### Option 2: Manual Deployment (Heroku, Railway, etc.)

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Set environment variables** on your hosting platform:
   - `MONGODB_URL`
   - `CLOUDINARY_URL`
   - `SESSION_SECRET`
   - `NODE_ENV=production`

3. **Deploy using your platform's CLI or web interface**

### Option 3: Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 5000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t alumni-platform .
docker run -p 5000:5000 --env-file .env alumni-platform
```

## Development Guidelines

### Code Organization

- **Components**: Reusable UI components in `/client/src/components/`
- **Pages**: Route-specific components in `/client/src/pages/`
- **API Routes**: RESTful endpoints in `/server/routes.ts`
- **Database**: MongoDB operations in `/server/mongodb-storage.ts`
- **Types**: Shared TypeScript types in `/shared/mongodb-schema.ts`

### Adding New Features

1. **Database Schema**: Define in `/shared/mongodb-schema.ts`
2. **API Endpoints**: Add to `/server/routes.ts`
3. **Frontend Components**: Create in appropriate `/client/src/` directories
4. **Routing**: Update `/client/src/App.tsx`

### Mobile Responsiveness

The application uses Tailwind CSS responsive design:
- Mobile-first approach with `sm:`, `md:`, `lg:` breakpoints
- Responsive navigation with mobile menu
- Adaptive layouts for dashboards and forms
- Touch-friendly interactive elements

## Contributing

1. Follow the existing code style and structure
2. Use TypeScript for type safety
3. Implement responsive design for all new components
4. Test on both mobile and desktop
5. Update documentation for new features

## Support

For development questions or deployment issues, refer to:
- MongoDB documentation for database setup
- Cloudinary documentation for media upload configuration
- Tailwind CSS documentation for responsive design
- React and Express documentation for framework-specific guidance