# 🚛 KIPS Transport Management System (KTS)

> **Modern, efficient, and reliable transport management for the education sector.**

Welcome to the KIPS Transport System (KTS)! 🎓🚌

This project was built to solve a real-world problem: managing the complex logistics of transport for a large educational network. It replaces outdated manual processes with a sleek, automated, and role-based digital workflow.

Whether you're an Admin overseeing the entire fleet, a Manager approving travel requests, or a Transport Officer assigning vehicles—KTS makes your life easier.

---

## ✨ Why This Project Exists

Managing transport for hundreds of employees across multiple campuses is chaos without the right tools. We built KTS to:

*   **Kill the Paperwork:** No more lost forms or manual tracking.
*   **Streamline Approvals:** Requests flow instantly from Employee → Manager → Transport.
*   **Boost Accountability:** Every trip, vehicle, and maintenance request is tracked and logged.
*   **Look Good Doing It:** Who says enterprise software has to be ugly? We focused heavily on a premium, modern UI.

## 🚀 Key Features

*   **🔐 Role-Based Power:** Secure, custom dashboards for Employees, Managers, Transport Officers, and Admins. Everyone sees exactly what they need.
*   **⚡ Automated Workflows:**
    *   **Request:** Employees book requests in seconds.
    *   **Approve:** Managers get notified and approve with one click.
    *   **Assign:** Transport team assigns drivers/vehicles seamlessly.
*   **🛠 Fleet Health:** dedicated modules for tracking vehicle maintenance and repairs.
*   **💸 TADA Management:** Integrated travel allowance calculations and approvals.
*   **🔔 Real-Time Updates:** Always know the status of your request.

## 🛠 Under the Hood

We used a modern stack to ensure performance, security, and scalability:

*   **Next.js 16 (App Router):** The latest and greatest for fast, server-side rendered apps.
*   **Prisma & SQLite:** robust ORM with a lightweight database for easy setup.
*   **React 19:** Leveraging the newest React features.
*   **Zod & TypeScript:** Rock-solid type safety and validation.
*   **Framer Motion:** Smooth, professional animations that make the app feel alive.
*   **Tailwind CSS:** For that pixel-perfect, custom design.

---

## 🏁 Getting Started

Want to take it for a spin? functionality is just a few commands away.

### 1. Clone the Repo
```bash
git clone https://github.com/Ammar-30/KTS.git
cd KTS
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment
Create a `.env` file in the root directory. You'll need a database URL and a JWT secret.
```env
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="super-secret-key-change-me"
```

### 4. Initialize Database
```bash
npx prisma migrate dev --name init
npm run seed  # This populates the app with dummy data so you can test right away!
```

### 5. Run it!
```bash
npm run dev
```
Visit `http://localhost:3000` and you're live! 🚀

---

## 🧪 Default Login Credentials

We've pre-loaded some accounts for you to test different roles:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@kips.pk` | `password123` |
| **Manager** | `manager@kips.pk` | `password123` |
| **Transport** | `transport@kips.pk` | `password123` |
| **Employee** | `ali.hassan@kips.pk` | `password123` |

---

## 👨‍💻 Built By

**Ammar** - *Senior Software Engineer*

---

*© 2025 KIPS Education System. Built with ❤️ and code.*
