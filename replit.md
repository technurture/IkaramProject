# Alumni Community Platform

## Overview
This project is a full-stack alumni community platform designed to foster engagement and connection among alumni. It enables users to share stories via blogs, register for events, connect with staff, and interact through comments. Key capabilities include robust user authentication, role-based access control, media management via Cloudinary, and a comprehensive admin dashboard. The platform aims to be a central hub for alumni interactions, enhancing community ties and facilitating communication.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React with TypeScript (Vite).
- **UI/UX**: Radix UI primitives with shadcn/ui components; Tailwind CSS for styling.
- **State Management**: TanStack Query for server state.
- **Routing**: Wouter.
- **Forms**: React Hook Form with Zod validation.
- **Responsiveness**: Comprehensive mobile-first responsive design across all pages and admin dashboards.

### Backend
- **Framework**: Express.js with TypeScript.
- **Database ORM**: Drizzle ORM (though Mongoose is used for MongoDB interactions).
- **Authentication**: Passport.js with local strategy and session-based authentication (PostgreSQL session store, though MongoDB is used for persistence).
- **File Upload**: Multer for `multipart/form-data`.
- **API Design**: RESTful API with role-based middleware.

### Database Design
- **Primary Database**: MongoDB Atlas with Mongoose ODM.
- **Key Entities**: Users (with roles: user, admin, super_admin), Blogs, Comments, Events (now announcement-style), Staff profiles, Media files.
- **Super Admin System**: Built-in approval system for managing administrators.

### Authentication & Authorization
- **Session Management**: Express sessions with MongoDB store.
- **Password Security**: Scrypt hashing.
- **Role-Based Access**: User, admin, and super_admin roles with protected routes and a three-tier system.
- **Admin Approval System**: Super admins manage (approve/reject/reactivate) other administrators.
- **Password Management**: Functionality for all admin users to change passwords.

### Media Management
- **Cloud Storage**: Cloudinary for image and video storage.
- **Features**: Automatic optimization, format conversion, folder-based organization, drag-and-drop upload, real-time progress, and an advanced MediaGallery component with viewing, swiping, and download capabilities.

### Event System
- Events function as announcement-style posts without registration or attendance tracking.
- Includes a comprehensive attachment display system with an interactive image gallery.

## External Dependencies

### Core Infrastructure
- **Database**: MongoDB Atlas.
- **Cloud Storage**: Cloudinary.
- **Session Store**: MongoDB (for session persistence).

### Frontend Libraries
- **UI Framework**: React 18 with TypeScript.
- **Component Library**: Radix UI and shadcn/ui.
- **Query Management**: TanStack Query.
- **Form Management**: React Hook Form, Hookform Resolvers, Zod.
- **Styling**: Tailwind CSS, class-variance-authority.
- **Date Handling**: date-fns.

### Backend Libraries
- **Web Framework**: Express.js with TypeScript.
- **Database**: MongoDB with Mongoose ODM.
- **Authentication**: Passport.js.
- **File Upload**: Multer.
- **Session Management**: `express-session` with `connect-mongo`.
- **Security**: Node.js `crypto` module.