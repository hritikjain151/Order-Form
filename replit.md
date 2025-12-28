# ProcureFlow - Purchase Order Management System

## Overview

ProcureFlow is a full-stack purchase order management application built for tracking procurement workflows. The system allows users to create and manage items, generate purchase orders with multiple line items, and track order processing through defined workflow stages. It's designed for manufacturing or procurement teams who need to monitor order status from initial feasibility through delivery.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack React Query for server state caching and synchronization
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens defined in CSS variables
- **Animations**: Framer Motion for smooth transitions
- **Forms**: React Hook Form with Zod validation

The frontend follows a pages-based architecture with shared components. Key pages include:
- Home: Purchase order creation and listing
- Items: Item master data management
- Item Details: Searchable item catalog with editing
- Process Orders: Workflow stage tracking
- Detailed Order Status: Comprehensive order monitoring with history

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful endpoints defined in `shared/routes.ts` with Zod schemas for type-safe validation
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Build System**: Vite for frontend, esbuild for server bundling

The server uses a storage abstraction layer (`IStorage` interface) implemented by `DatabaseStorage` class, allowing for potential storage backend changes.

### Data Models
Core entities defined in `shared/schema.ts`:
- **Items**: Master catalog with material numbers, vendor info, pricing, and specifications
- **Purchase Orders**: Order headers with PO number, vendor, dates, and remarks
- **Purchase Order Items**: Line items linking items to orders with quantity and process tracking
- **Process History**: Audit trail for workflow stage transitions

### Workflow Stages
The system tracks 11 sequential processing stages:
1. Feasibility → 2. Designing → 3. Cutting → 4. Internal Quality → 5. Processing → 6. Fabrication → 7. Finishing → 8. Internal Quality → 9. Customer Quality → 10. Ready For Dispatch → 11. Delivered

### Shared Code Strategy
The `shared/` directory contains code used by both frontend and backend:
- `schema.ts`: Database table definitions and Zod validation schemas
- `routes.ts`: API endpoint definitions with request/response types

This ensures type safety across the full stack.

### Build and Development
- Development: `npm run dev` runs the Express server with Vite middleware for HMR
- Production: `npm run build` creates optimized bundles, `npm start` serves the built application
- Database: `npm run db:push` syncs Drizzle schema to PostgreSQL

## External Dependencies

### Database
- **PostgreSQL**: Primary data store via `DATABASE_URL` environment variable
- **Drizzle ORM**: Schema management and query building
- **connect-pg-simple**: Session storage for Express (if sessions are added)

### Frontend Libraries
- **Radix UI**: Accessible, unstyled component primitives (dialog, select, tabs, etc.)
- **TanStack React Query**: Server state management with caching
- **date-fns**: Date formatting and manipulation
- **Framer Motion**: Animation library
- **Lucide React**: Icon library

### Development Tools
- **Vite**: Frontend dev server and bundler
- **esbuild**: Server-side bundling for production
- **TypeScript**: Type checking across the stack
- **Tailwind CSS**: Utility-first styling

### Replit-specific
- `@replit/vite-plugin-runtime-error-modal`: Error overlay in development
- `@replit/vite-plugin-cartographer`: Dev tooling integration
- `@replit/vite-plugin-dev-banner`: Development environment indicator