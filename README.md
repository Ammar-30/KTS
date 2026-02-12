


## 🛠 TechStack

We used a modern stack to ensure performance, security, and scalability:

*   **Next.js 16 (App Router):** The latest and greatest for fast, server-side rendered apps.
*   **Prisma & SQLite:** robust ORM with a lightweight database for easy setup.
*   **React 19:** Leveraging the newest React features.
*   **Zod & TypeScript:** Rock-solid type safety and validation.
*   **Framer Motion:** Smooth, professional animations that make the app feel alive.
*   **Tailwind CSS:** For that pixel-perfect, custom design.

---

## 🏁 Getting Started

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
