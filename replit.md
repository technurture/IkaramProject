# Alumni Community Platform

## Overview

This is a full-stack alumni community platform built with React, Express, and PostgreSQL. The platform enables alumni to share stories through blogs, register for events, connect with staff members, and engage with the community through comments and interactions. It features user authentication, role-based access control, media management through Cloudinary, and a comprehensive admin dashboard.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Components**: Radix UI primitives with shadcn/ui components for consistent design
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for type-safe form handling

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Passport.js with local strategy using session-based authentication
- **Session Storage**: PostgreSQL session store for persistent sessions
- **File Upload**: Multer for handling multipart/form-data uploads
- **API Design**: RESTful API with role-based middleware for authorization

### Database Design
- **Primary Database**: MongoDB with Mongoose ODM
- **Schema Management**: Mongoose schemas with TypeScript interfaces
- **Key Entities**:
  - Users with role-based access (user, admin, super_admin)
  - Blogs with categories, tags, and status management
  - Comments with hierarchical threading support
  - Events with registration tracking
  - Staff profiles with contact information
  - Media files with Cloudinary integration
- **Super Admin System**: Built-in super admin approval system for managing other administrators

### Authentication & Authorization
- **Session Management**: Express sessions with MongoDB store
- **Password Security**: Scrypt hashing with salt for secure password storage
- **Role-Based Access**: User, admin, and super_admin roles with protected routes
- **Admin Approval System**: Super admins can approve/reject/reactivate other administrators
- **Middleware Protection**: Route-level authentication and authorization guards
- **Super Admin**: Default super admin account (superadmin@ikaram.edu / SuperAdmin123!)

### Media Management
- **Cloud Storage**: Cloudinary for image and video storage
- **File Processing**: Automatic optimization and format conversion
- **Upload Handling**: Memory-based multer storage with file type validation
- **Asset Organization**: Folder-based organization in Cloudinary

## External Dependencies

### Core Infrastructure
- **Database**: MongoDB (configured with environment variable MONGODB_URL)
- **Cloud Storage**: Cloudinary for media files and asset management
- **Session Store**: MongoDB-based session persistence

### Frontend Libraries
- **UI Framework**: React 18 with TypeScript
- **Component Library**: Radix UI primitives with shadcn/ui styling
- **Query Management**: TanStack Query for server state
- **Form Management**: React Hook Form with Hookform Resolvers
- **Validation**: Zod for runtime type checking and validation
- **Styling**: Tailwind CSS with class-variance-authority
- **Date Handling**: date-fns for date formatting and manipulation

### Backend Libraries
- **Web Framework**: Express.js with TypeScript support
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Passport.js with local strategy
- **File Upload**: Multer for multipart form handling
- **Session Management**: express-session with connect-mongo
- **Security**: Built-in crypto module for password hashing

### Development Tools
- **Build Tool**: Vite for fast development and optimized builds
- **TypeScript**: Full type safety across frontend and backend
- **Code Quality**: ESBuild for production bundling
- **Development**: Replit-specific plugins for enhanced development experience

## Recent Changes (August 16, 2025)

### Database Migration to MongoDB
- Migrated from PostgreSQL/Drizzle to MongoDB/Mongoose for improved scalability
- Updated all schema definitions with TypeScript interfaces
- Configured secure MongoDB connection using MONGODB_URL environment variable
- Implemented MongoDB session store for persistent user sessions

### Super Admin Management System
- Added super_admin role with elevated privileges
- Implemented admin approval workflow (new admins require super admin approval)
- Created default super admin account: superadmin@ikaram.edu / SuperAdmin123!
- Added API endpoints for super admin to manage other administrators:
  - GET /api/admin/pending - View pending admin approvals
  - GET /api/admin/all - View all administrators
  - PUT /api/admin/:id/approve - Approve/reject admin accounts
  - PUT /api/admin/:id/reactivate - Reactivate deactivated admins

### Security Enhancements
- Database credentials now stored securely in environment variables
- Enhanced role-based access control with three-tier system
- Admin accounts require super admin approval before activation
- Improved password hashing with scrypt algorithm

### User Experience Improvements
- Fixed hero section text visibility with better contrast
- Updated navigation branding to show only "Ikaram"
- Changed "Explore Stories" button to black for better visibility
- Fixed footer logo display and updated branding to "TechNurture"
- Added proper social media icons (Facebook, Twitter, LinkedIn, Instagram)
- Improved contact page text visibility with dark text on light background