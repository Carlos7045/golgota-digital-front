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
- Multi-channel communication system (General, Training, Camps, Financial, etc.)
- Rank-based channel access permissions
- Company-based organization structure
- Real-time messaging capabilities (foundation laid)
- Financial channel for all members to view payment status and categories

### Administrative Dashboard
- User management with rank promotion capabilities
- Event and content management
- Financial tracking for membership fees
- Company management and assignment
- Community statistics and analytics

### Payment Management System
- Monthly subscription fees of R$10 for members with rank "Soldado" and above
- Asaas payment integration with PIX and Boleto support
- Automatic payment tracking and webhook processing
- User-friendly payment management interface
- Real-time payment status updates

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
- July 07, 2025. Implemented complete financial management system with real database data, payment tracking, and transaction management
- July 07, 2025. Fixed login issue for Melry Pacheco Salgado (melrysalgado704@gmail.com) by updating password hash
- July 07, 2025. Corrected hardcoded company names: removed "CIA Alpha" references and now displaying actual user companies from database
- July 07, 2025. Enhanced profile data display: added CPF and city fields to profile view and editing form, all personal data now properly displayed
- July 07, 2025. Integrated complete Asaas payment system for monthly membership fees: R$10/month for members with rank "Soldado" and above, supports PIX and Boleto payments, includes webhook processing
- July 07, 2025. Added Financial Channel to community section: all members can now view payment status, available categories (donations, events, special offers), and manage contributions through dedicated financial panel
- July 07, 2025. Removed all mock financial data and connected payment system to real database: admin panel now shows actual payment status, functional buttons for payment confirmation and reminders, integrated with Asaas payment system
- July 07, 2025. Implemented Interactive Financial Health Dashboard: comprehensive real-time monitoring with health score calculation, collection rate tracking, member growth analysis, payment delay metrics, and strategic recommendations for organizational financial health
- July 07, 2025. Implemented comprehensive categorized event management system: created TrainingsChannel, CampsChannel, and CampaignsChannel for different event types (Rally/CPLG/FEG for training, Acampamentos for camps, Campanhas/Doações for campaigns), updated database schema with new event categorization, enhanced EventManagement component with full event creation capabilities including payment integration, all events properly categorized and displayed in appropriate community channels
- July 07, 2025. Implemented Advanced Event Status Management System: expanded event status from basic 3 states to comprehensive 7-state workflow (Planejamento → Publicado → Inscrições Abertas → Últimos Dias → Em Andamento → Finalizado → Cancelado), added smart status progression buttons in admin panel, implemented automatic status updates based on dates (events auto-transition to "Em Andamento" when date arrives, "Finalizado" when end date passes, "Últimos Dias" when 7 days remaining), updated all community channels and dashboard to display new status system with color-coded badges
- July 07, 2025. Implemented Functional Event Registration System: created event_registrations table with complete schema, added backend APIs for enrollment/unenrollment with participant count tracking, integrated Asaas payment system for paid events with PIX/Boleto generation, implemented functional enrollment buttons in TrainingsChannel and CampsChannel with real-time payment processing, fixed asaasService import issue in routes.ts for proper payment integration
- July 07, 2025. Enhanced Asaas Payment System with Multiple Payment Methods: expanded support to include PIX, Boleto, Credit Card, Debit Card, and UNDEFINED (customer choice), added installment support (up to 12x for credit cards), implemented payment links with automatic redirect and custom branding, configured checkout customization with Comando Gólgota military colors (military-gold #D4AF37, military-black #1A1A1A), enhanced payment interface with better user experience showing payment options and installment details, improved error handling with detailed payment processing feedback
- July 07, 2025. Removed All Fictitious Data from Financial Reports and Implemented Complete Expense Management System: replaced all mock data in financial reports with real database data showing actual income (R$ 150.00 from events) and expenses (R$ 50.00), implemented comprehensive expense registration system with modal form including description, amount, category selection, date picker, and notes field, created 6 expense categories in database (Aluguel, Material, Alimentação, Transporte, Equipamentos, Administrativo), updated backend routes to properly handle expense creation and category retrieval, fixed all financial dashboard cards to display real-time data including total income, total expenses, net balance, and payment rate calculations, system now provides complete financial tracking for both incoming revenues and outgoing expenses
- July 07, 2025. Implemented Real-time Financial Health Dashboard with Synchronized Data: created comprehensive "Saúde Financeira" tab within Financial Management with health score calculation based on real transaction data, added 4-card dashboard showing health score (circular progress), financial metrics (income/expenses/balance), activity metrics (transaction count, average amounts), and strategic recommendations based on actual performance indicators, synchronized health metrics API to use real financial transactions data instead of mock data, implemented intelligent health scoring algorithm considering collection rate, expense ratio, net balance, and transaction activity, added color-coded status indicators and automated recommendations for financial optimization, removed duplicate standalone dashboard to maintain single integrated financial interface
- July 07, 2025. Liberated Camps Channel Access: changed minimum rank requirement from "soldado" to "aluno" allowing all community members to view and access the acampamentos channel, enabling broader participation in camp events and activities
- July 07, 2025. Fixed Date Display Timezone Issues: corrected date formatting across all frontend components (Profile, PaymentManagement, FinancialManagement, UserManagement) to properly display birth dates and due dates without timezone conversion problems, ensuring dates like 01/12/2004 display correctly instead of 30/11/2004
- July 07, 2025. Implemented Functional Profile Photo Upload System: created complete avatar upload functionality with image validation (5MB limit, image types only), multer middleware for file handling, automatic old file cleanup, proper error handling, fallback initials display, responsive loading states, and avatar serving through Express static middleware, users can now upload and change profile photos seamlessly
- July 07, 2025. Enhanced Chat System with Real-time Features: implemented modern Discord-style general chat with improved message layout using avatars and better visual hierarchy, added real online user counter with actual database data (replaces hardcoded "23 Online"), created comprehensive direct messaging system with modal interface for starting private conversations, added online user display with avatars in general channel header, improved message input area with character counter and enhanced UX, integrated all avatar uploads throughout chat system for personalized experience
- July 07, 2025. Fixed Authentication System and Admin Panel Access: resolved authentication issues that were preventing admin panel access with 401 errors, corrected password hashing for administrator account (chpsalgado@hotmail.com), implemented proper session management, created generalMessages table for company announcements system, completed functional Company Panel (Painel CIA Quemuel) with real database integration showing live statistics, member management, and announcements functionality, all admin and company panel features now fully operational
- July 08, 2025. Configured Complete Vercel Deploy Setup: created vercel.json for SPA routing, vite.config.vercel.ts for optimized production build, package.frontend.json with frontend-only dependencies, comprehensive README.deploy.md with step-by-step instructions, .env.example with environment variables setup, project fully prepared for frontend deployment on Vercel with backend separation strategy
- July 08, 2025. Prepared Complete Railway Backend Migration: modified server to use dynamic PORT environment variable, implemented SESSION_SECRET validation, added WebSocket server on /ws path for real-time chat, configured Multer for Railway temp directory compatibility, created health check endpoint (/health), implemented comprehensive error handling, created railway.json configuration, package.railway.json with backend-only dependencies, .env.railway template with all required variables, Dockerfile.railway for custom deployment, README.railway.md with complete migration guide, backend fully ready for Railway deployment with same Neon database connection

## User Preferences

Preferred communication style: Simple, everyday language.