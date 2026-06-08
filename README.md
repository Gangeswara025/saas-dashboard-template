<div align="center">

```
 ██████╗██╗     ██╗███████╗███╗   ██╗████████╗    ██████╗  ██████╗ ██████╗ ████████╗ █████╗ ██╗
██╔════╝██║     ██║██╔════╝████╗  ██║╚══██╔══╝    ██╔══██╗██╔═══██╗██╔══██╗╚══██╔══╝██╔══██╗██║
██║     ██║     ██║█████╗  ██╔██╗ ██║   ██║       ██████╔╝██║   ██║██████╔╝   ██║   ███████║██║
██║     ██║     ██║██╔══╝  ██║╚██╗██║   ██║       ██╔═══╝ ██║   ██║██╔══██╗   ██║   ██╔══██║██║
╚██████╗███████╗██║███████╗██║ ╚████║   ██║       ██║     ╚██████╔╝██║  ██║   ██║   ██║  ██║███████╗
 ╚═════╝╚══════╝╚═╝╚══════╝╚═╝  ╚═══╝   ╚═╝       ╚═╝      ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚══════╝
```

<h3><i>The command center your clients actually want to log into.</i></h3>

<br/>

[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com/)
[![Express](https://img.shields.io/badge/Express_v5-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Razorpay](https://img.shields.io/badge/Razorpay-02042B?style=for-the-badge&logo=razorpay&logoColor=3395FF)](https://razorpay.com/)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](CONTRIBUTING.md)
[![Made with ❤️](https://img.shields.io/badge/Made%20with-%E2%9D%A4%EF%B8%8F-red?style=flat-square)]()

<br/>

> **ClientPortal** is a production-ready, full-stack SaaS platform that gives agencies and businesses a single command center to manage clients, track projects, handle billing, share files, and resolve issues — all behind role-based access control.

<br/>

---

</div>

## 📸 Screenshots

<div align="center">

| Admin Dashboard | Client View | Invoice & Billing |
|:-:|:-:|:-:|
| ![Admin Dashboard](https://placehold.co/380x220/0f172a/38bdf8?text=Admin+Dashboard&font=raleway) | ![Client View](https://placehold.co/380x220/0f172a/a78bfa?text=Client+View&font=raleway) | ![Billing](https://placehold.co/380x220/0f172a/34d399?text=Invoice+%26+Billing&font=raleway) |

| Task Tracker | File Hub | Issue Board |
|:-:|:-:|:-:|
| ![Tasks](https://placehold.co/380x220/1e293b/f472b6?text=Task+Tracker&font=raleway) | ![Files](https://placehold.co/380x220/1e293b/fb923c?text=File+Hub&font=raleway) | ![Issues](https://placehold.co/380x220/1e293b/facc15?text=Issue+Board&font=raleway) |

</div>

<br/>

---

## ✨ Features at a Glance

<table>
<tr>
<td width="50%">

### 🔐 Role-Based Access Control
Two distinct portals — **Admin** and **Client** — each with their own dashboard, permissions, and workflows. Clients only see what they need to; admins control everything.

</td>
<td width="50%">

### 📋 Project & Task Management
Assign tasks, track deliverables, add project notes, and monitor progress across every active engagement — all in one place.

</td>
</tr>
<tr>
<td width="50%">

### 💳 Integrated Billing via Razorpay
Generate invoices, track payment status, and let clients pay directly inside the portal. Powered by Razorpay's secure payment gateway — built for India.

</td>
<td width="50%">

### 🗂️ Secure File Hub
Upload, store, and share deliverables with clients through a dedicated document hub. Multer-powered with protected routes so only the right eyes see the right files.

</td>
</tr>
<tr>
<td width="50%">

### 🐛 Issue Tracker
Clients can raise issues; admins can triage and resolve them. Full lifecycle tracking with status updates and searchable history.

</td>
<td width="50%">

### 🔔 Activity Logs & Notifications
Every action is logged. Searchable activity feeds and real-time notifications via React Hot Toast keep everyone on the same page, always.

</td>
</tr>
</table>

<br/>

---

## 🏗️ Architecture

```
ClientPortal/
│
├── 📁 client/                          # React + Vite Frontend
│   ├── 📁 src/
│   │   ├── 📁 components/              # Reusable UI components
│   │   │   ├── 📁 admin/               # Admin-specific views
│   │   │   ├── 📁 client/              # Client-specific views
│   │   │   └── 📁 shared/              # Shared layout, modals, etc.
│   │   ├── 📁 pages/                   # Route-level page components
│   │   ├── 📁 hooks/                   # Custom React hooks
│   │   ├── 📁 context/                 # Auth & global state
│   │   ├── 📁 services/                # Axios API service layer
│   │   └── 📁 utils/                   # Helper functions
│   └── vite.config.js
│
├── 📁 server/                          # Express.js Backend
│   ├── 📁 controllers/                 # Route handler logic
│   │   ├── authController.js
│   │   ├── projectController.js
│   │   ├── taskController.js
│   │   ├── invoiceController.js
│   │   ├── fileController.js
│   │   └── issueController.js
│   ├── 📁 models/                      # Mongoose schemas
│   │   ├── User.js
│   │   ├── Project.js
│   │   ├── Task.js
│   │   ├── Invoice.js
│   │   ├── File.js
│   │   └── Issue.js
│   ├── 📁 routes/                      # Express route definitions
│   ├── 📁 middleware/                  # Auth guard, error handler, multer
│   ├── 📁 uploads/                     # Multer file storage
│   └── server.js
│
└── README.md
```

<br/>

---

## 🛠️ Tech Stack

<div align="center">

### Frontend

| Technology | Role |
|:--|:--|
| **React 19** | Core UI framework |
| **Vite** | Lightning-fast dev server & bundler |
| **React Router v7** | Client-side routing |
| **Tailwind CSS** + `@tailwindcss/forms` | Utility-first styling with clean inputs |
| **Framer Motion** | Smooth page & component animations |
| **Lucide React** | Clean, consistent icon set |
| **React Hot Toast** | Non-intrusive toast notifications |
| **Axios** | HTTP client for API communication |

### Backend

| Technology | Role |
|:--|:--|
| **Node.js + Express v5** | REST API server |
| **MongoDB + Mongoose** | Document database & ODM |
| **JWT + bcryptjs** | Stateless auth & secure password hashing |
| **Multer** | File upload handling |
| **Razorpay SDK** | Payment gateway integration |
| **Morgan** | HTTP request logging |
| **CORS** | Cross-origin request control |

</div>

<br/>

---

## 🚀 Getting Started

### Prerequisites

Make sure you have these installed:

```bash
node >= 18.x
npm >= 9.x
MongoDB (local or Atlas URI)
```

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/client-portal.git
cd client-portal
```

### 2. Configure Environment Variables

**Server** — create `server/.env`:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/clientportal

# Authentication
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d

# Razorpay (get keys from dashboard.razorpay.com)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret

# File Uploads
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
```

**Client** — create `client/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
```

### 3. Install Dependencies

```bash
# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 4. Seed the Database (Optional)

```bash
cd server
npm run seed
```

> This creates a default **Admin** account: `admin@clientportal.com` / `Admin@123`

### 5. Run the Application

```bash
# Terminal 1 — Start the backend
cd server && npm run dev

# Terminal 2 — Start the frontend
cd client && npm run dev
```

🎉 Open **http://localhost:5173** — your portal is live.

<br/>

---

## 📡 API Reference

<details>
<summary><strong>🔐 Authentication</strong></summary>

| Method | Endpoint | Access | Description |
|:--|:--|:--|:--|
| `POST` | `/api/auth/register` | Public | Register a new client |
| `POST` | `/api/auth/login` | Public | Login & receive JWT |
| `GET` | `/api/auth/me` | Protected | Get current user profile |
| `POST` | `/api/auth/logout` | Protected | Invalidate session |

</details>

<details>
<summary><strong>📋 Projects & Tasks</strong></summary>

| Method | Endpoint | Access | Description |
|:--|:--|:--|:--|
| `GET` | `/api/projects` | Admin/Client | List all accessible projects |
| `POST` | `/api/projects` | Admin | Create a new project |
| `GET` | `/api/projects/:id` | Admin/Client | Get project details |
| `PUT` | `/api/projects/:id` | Admin | Update project |
| `DELETE` | `/api/projects/:id` | Admin | Delete project |
| `GET` | `/api/projects/:id/tasks` | Admin/Client | List tasks for a project |
| `POST` | `/api/projects/:id/tasks` | Admin | Add a task |
| `PUT` | `/api/tasks/:id` | Admin | Update task status |

</details>

<details>
<summary><strong>💳 Invoices & Payments</strong></summary>

| Method | Endpoint | Access | Description |
|:--|:--|:--|:--|
| `GET` | `/api/invoices` | Admin/Client | List invoices |
| `POST` | `/api/invoices` | Admin | Create an invoice |
| `POST` | `/api/invoices/:id/pay` | Client | Initiate Razorpay payment |
| `POST` | `/api/invoices/verify` | Client | Verify payment signature |
| `GET` | `/api/invoices/:id` | Admin/Client | Get invoice details |

</details>

<details>
<summary><strong>🗂️ Files & Issues</strong></summary>

| Method | Endpoint | Access | Description |
|:--|:--|:--|:--|
| `POST` | `/api/files/upload` | Admin | Upload a deliverable |
| `GET` | `/api/files` | Admin/Client | List accessible files |
| `DELETE` | `/api/files/:id` | Admin | Remove a file |
| `GET` | `/api/issues` | Admin/Client | List all issues |
| `POST` | `/api/issues` | Client | Raise a new issue |
| `PUT` | `/api/issues/:id` | Admin | Update issue status |

</details>

<br/>

---

## 🔒 Security

- **JWT-based stateless auth** — tokens stored securely with expiry
- **bcryptjs password hashing** — passwords never stored in plaintext
- **Role-guard middleware** — every protected route validates both authentication and role
- **Razorpay signature verification** — payment webhooks validated cryptographically
- **Multer file validation** — file type and size limits enforced server-side
- **CORS policy** — only whitelisted origins accepted

<br/>

---

## 🗺️ Roadmap

- [x] JWT authentication with role-based access
- [x] Project & task management module
- [x] Razorpay invoice & payment integration
- [x] File upload & secure delivery hub
- [x] Issue tracker with status lifecycle
- [x] Activity logs & toast notifications
- [ ] Real-time updates via WebSockets
- [ ] Email notifications (Nodemailer / Resend)
- [ ] Multi-tenant support (agency → multiple workspaces)
- [ ] Client onboarding flow with invite links
- [ ] Analytics dashboard with charts
- [ ] Mobile app (React Native)

<br/>

---

## 🤝 Contributing

Contributions are welcome and appreciated!

```bash
# 1. Fork the repository
# 2. Create your feature branch
git checkout -b feature/your-feature-name

# 3. Commit your changes
git commit -m "feat: add your feature description"

# 4. Push to your fork
git push origin feature/your-feature-name

# 5. Open a Pull Request
```

Please follow the [Conventional Commits](https://www.conventionalcommits.org/) spec for commit messages.

<br/>

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for details.

<br/>

---

<div align="center">

Built with focus and caffeine by **[Trintz](https://trintz.in)**

[![GitHub](https://img.shields.io/badge/GitHub-Gangeswara025-181717?style=flat-square&logo=github)](https://github.com/Gangeswara025)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-gangeswarajj25-0A66C2?style=flat-square&logo=linkedin)](https://linkedin.com/in/gangeswarajj25)
[![Website](https://img.shields.io/badge/Portfolio-gangeswara.site-FF6B6B?style=flat-square&logo=globe)](https://gangeswara.site)

<br/>

*If this project helped you, consider giving it a ⭐ — it means a lot!*

</div>
