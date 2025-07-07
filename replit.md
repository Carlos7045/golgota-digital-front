# COMANDO GÓLGOTA - Community Platform

## Overview

A comprehensive web application built for the Comando Gólgota community - a military-style Christian training organization. The platform serves as a digital hub for members to access training materials, participate in community discussions, and manage organizational activities. Built with modern web technologies including React, TypeScript, Express.js, and PostgreSQL with Drizzle ORM.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with custom military-themed design system
- **State Management**: TanStack Query for server state, React Context for auth
- **Routing**: React Router for client-side navigation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL via Neon serverless
- **ORM**: Drizzle ORM for type-safe database operations
- **Session Management**: PostgreSQL-based sessions
- **Authentication**: Custom auth system with user profiles

### Design System
- **Theme**: Military-inspired dark theme with olive and gold color scheme
- **Components**: Comprehensive UI component library based on Radix UI
- **Typography**: Inter font family for modern readability
- **Icons**: Lucide React icon library

## Key Components

### Authentication System
- User registration and login functionality
- Profile management with military ranks and company assignments
- Protected routes for authenticated users only
- Role-based access control (RBAC) with hierarchical rank system

### Community Features
- Multi-channel communication system (General, Training, Camps, etc.)
- Rank-based channel access permissions
- Company-based organization structure
- Real-time messaging capabilities (foundation laid)

### Administrative Dashboard
- User management with rank promotion capabilities
- Event and content management
- Financial tracking for membership fees
- Company management and assignment
- Community statistics and analytics

### Training Management
- Course catalog with different skill levels
- Training event scheduling and management
- Progress tracking and certification
- Resource library for educational materials

### Event System
- Rally and camp event organization
- Registration and participant management
- Calendar integration for scheduling
- Location and logistics management

## Data Flow

### User Journey
1. **Registration**: New users register with personal details and CPGL history
2. **Authentication**: Login system validates credentials and establishes session
3. **Community Access**: Authenticated users access rank-appropriate channels
4. **Training Participation**: Users enroll in courses and track progress
5. **Event Registration**: Members sign up for rallies and camps

### Data Architecture
- **User Profiles**: Comprehensive member information with military structure
- **Content Management**: Organized by channels and access levels
- **Event Data**: Structured event information with participant tracking
- **Financial Records**: Transaction tracking for fees and payments

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **drizzle-orm**: Type-safe ORM for database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Comprehensive UI primitive components
- **react-router-dom**: Client-side routing
- **tailwindcss**: Utility-first CSS framework

### Development Tools
- **vite**: Fast build tool and dev server
- **typescript**: Type safety and enhanced development experience
- **tsx**: TypeScript execution for Node.js
- **esbuild**: Fast JavaScript bundling

### UI Enhancement
- **class-variance-authority**: Component variant management
- **clsx**: Conditional className utility
- **date-fns**: Date manipulation and formatting
- **react-hook-form**: Form state management
- **zod**: Schema validation

## Deployment Strategy

### Development Environment
- Vite dev server with HMR for frontend development
- tsx for running TypeScript server code directly
- Database migrations via Drizzle Kit
- Environment variable management for database connections

### Production Build
- Vite builds optimized frontend bundle to `dist/public`
- esbuild bundles backend code for Node.js execution
- Static asset serving through Express.js
- PostgreSQL database hosted on Neon platform

### Environment Configuration
- Separate development and production database connections
- Environment-specific configuration through process.env
- Automatic database schema management via Drizzle

## Changelog
- July 07, 2025. Initial setup
- July 07, 2025. Unified registration system with comprehensive form collecting all member data  
- July 07, 2025. Made Carlos Henrique Pereira Salgado (chpsalgado@hotmail.com) an administrator with admin rank and role
- July 07, 2025. Fixed authentication system: migrated from Bearer tokens to session-based authentication for better security and reliability
- July 07, 2025. Implemented secure user deletion with admin password confirmation and cascading data removal
- July 07, 2025. Added comprehensive user editing functionality for administrators with complete form validation and backend routes
- July 07, 2025. Fixed company membership issue: users created via admin panel now automatically join their assigned companies in company_members table

## User Preferences

Preferred communication style: Simple, everyday language.