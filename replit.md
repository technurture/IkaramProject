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
- **Primary Database**: PostgreSQL with Neon serverless driver
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Key Entities**:
  - Users with role-based access (user, admin)
  - Blogs with categories, tags, and status management
  - Comments with hierarchical threading support
  - Events with registration tracking
  - Staff profiles with contact information
  - Media files with Cloudinary integration

### Authentication & Authorization
- **Session Management**: Express sessions with PostgreSQL store
- **Password Security**: Scrypt hashing with salt for secure password storage
- **Role-Based Access**: Admin and user roles with protected routes
- **Middleware Protection**: Route-level authentication and authorization guards

### Media Management
- **Cloud Storage**: Cloudinary for image and video storage
- **File Processing**: Automatic optimization and format conversion
- **Upload Handling**: Memory-based multer storage with file type validation
- **Asset Organization**: Folder-based organization in Cloudinary

## External Dependencies

### Core Infrastructure
- **Database**: PostgreSQL (configured for Neon serverless)
- **Cloud Storage**: Cloudinary for media files and asset management
- **Session Store**: PostgreSQL-based session persistence

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
- **Database**: Drizzle ORM with Neon PostgreSQL driver
- **Authentication**: Passport.js with local strategy
- **File Upload**: Multer for multipart form handling
- **Session Management**: express-session with connect-pg-simple
- **Security**: Built-in crypto module for password hashing

### Development Tools
- **Build Tool**: Vite for fast development and optimized builds
- **TypeScript**: Full type safety across frontend and backend
- **Code Quality**: ESBuild for production bundling
- **Development**: Replit-specific plugins for enhanced development experience