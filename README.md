# KIPS Transport Management System

A premium, modern transport management solution built with **Next.js 16**, **Prisma**, and **SQLite**. This system provides a streamlined, role-based workflow for transport requests, approvals, and vehicle assignments.

## ✨ Key Features

- **Role-Based Access Control (RBAC)**: Secure dashboards for Employees, Managers, Transport Officers, and Admins.
- **Centralized Middleware**: Global authentication and permission guarding using Next.js Middleware.
- **Automated Workflow**: 
  - Employees request transport for specific companies and departments.
  - Managers review and approve/reject requests.
  - Transport Officers assign drivers and vehicles to approved trips.
- **Maintenance Management**: Track and report issues for fleet and entitled vehicles.
- **TADA Requests**: Integrated TA/DA management for travel-related expenses.
- **Modern UI**: Polished interface with smooth transitions and premium aesthetics.
- **Notification System**: Real-time feedback and status updates.

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Runtime**: React 19
- **Database**: SQLite with Prisma ORM
- **Authentication**: JWT-based session management (`jose`)
- **Validation**: Strict schema validation with `Zod`
- **Styling**: Premium CSS with modern design tokens
- **Animations**: Framer Motion for smooth interactions

## 🚀 Getting Started

### Prerequisites

- Node.js >= 20.0.0
- npm

### Installation

1. **Clone and Install**
   ```bash
   git clone https://github.com/Ammar-30/KTS.git
   cd KTS
   npm install
   ```

2. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="file:./prisma/dev.db"
   JWT_SECRET="your-32-character-secret-key"
   ```

3. **Database Initialization**
   ```bash
   npx prisma migrate dev --name init
   npm run seed
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🔐 Security

The project implements several security best practices:
- **Global Middleware**: Centralized session verification and role checks.
- **Input Sanitization**: HTML stripping and validation for all user inputs.
- **Secure Headers**: Hardened `next.config.ts` with CSP, X-Frame-Options, and more.
- **Transaction Management**: Atomic database operations to prevent data inconsistency and race conditions.

## 👥 Seeded Accounts

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@kips.pk | password123 |
| **Manager** | manager@kips.pk | password123 |
| **Transport** | transport@kips.pk | password123 |
| **Employee** | ali.hassan@kips.pk | password123 |

---

© 2025 KIPS Education System. All rights reserved.
