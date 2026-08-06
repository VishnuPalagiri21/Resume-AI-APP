# 🚀 ResumeAI — Full Stack AI-Powered Recruitment Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green?logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v18%2B-blue?logo=react)](https://react.dev/)
[![React Native](https://img.shields.io/badge/React_Native-v0.72%2B-61DAFB?logo=react)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-SDK_49%2B-000000?logo=expo)](https://expo.dev/)
[![Express.js](https://img.shields.io/badge/Express.js-v4-000000?logo=express)](https://expressjs.com/)
[![MySQL / PostgreSQL](https://img.shields.io/badge/Database-MySQL%20%7C%20PostgreSQL-4479A1?logo=mysql)](https://www.mysql.com/)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen?style=flat&logo=github-actions)](https://github.com/)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen.svg?style=flat)](http://makeapullrequest.com)

**ResumeAI** is an enterprise-grade, end-to-end recruitment platform powered by Artificial Intelligence. It unifies Candidates, Recruiters, and Platform Administrators into a single cohesive ecosystem across Web and Mobile applications. Driven by state-of-the-art AI parsing, ATS scoring, candidate-job matching, and resume tailoring algorithms, ResumeAI streamlines talent acquisition and career growth.

---

## 📋 Table of Contents

- [✨ Key Highlights](#-key-highlights)
- [🏛️ System Architecture](#️-system-architecture)
- [💻 Portals & Capabilities](#-portals--capabilities)
  - [👨‍🎓 Candidate Portal](#-candidate-portal)
  - [💼 Recruiter Portal](#-recruiter-portal)
  - [🛡️ Admin Portal](#️-admin-portal)
- [🤖 Deep-Dive AI Capabilities](#-deep-dive-ai-capabilities)
- [🛠️ Tech Stack](#️-tech-stack)
- [📁 Repository Directory Structure](#-repository-directory-structure)
- [🚀 Quick Start & Installation Guide](#-quick-start--installation-guide)
- [🔑 Environment Variables](#-environment-variables)
- [🏃 Running the Platform](#-running-the-platform)
- [📡 API Architecture & Documentation](#-api-architecture--documentation)
- [🗄️ Database Schema & Entities](#️-database-schema--entities)
- [📸 Application Screenshots](#-application-screenshots)
- [🌐 Deployment Blueprint](#-deployment-blueprint)
- [🔒 Security & Compliance](#-security--compliance)
- [⚡ Performance Optimizations](#-performance-optimizations)
- [🔮 Future Roadmap](#-future-roadmap)
- [🤝 Contributing Guidelines](#-contributing-guidelines)
- [📄 License](#-license)
- [👨‍💻 Authors & Credits](#-authors--credits)
- [🙏 Acknowledgements](#-acknowledgements)

---

## ✨ Key Highlights

- **Multi-Tenant Tri-Portal Architecture**: Dedicated interfaces tailored for Candidates, Recruiters, and Platform Administrators.
- **Cross-Platform Access**: Native web experience built with React and seamless mobile app built with React Native & Expo.
- **Flexible Dual AI Engine**: Plug-and-play support for cloud AI providers (OpenAI, Anthropic, Gemini) or privacy-first local LLMs (Ollama, LocalAI).
- **Automated Resume Parsing & ATS Intelligence**: High-accuracy parsing of PDF/DOCX resumes into structured JSON with real-time scoring.
- **Real-Time LaTeX & PDF Resume Builder**: Dynamic resume compilation with customizable templates, LaTeX export, and instant preview.
- **Unified REST Engine**: Single Node.js/Express backend powering Web, Mobile, and internal automation.

---

## 🏛️ System Architecture

```mermaid
graph TD
    %% Frontend Applications
    subgraph Clients ["Client Applications"]
        WA["🌐 Web Application (React)"]
        MA["📱 Mobile Application (React Native / Expo)"]
    end

    %% API Gateway / Backend Layer
    subgraph Backend ["Backend Engine (Node.js / Express)"]
        API["📡 REST API Gateway"]
        AUTH["🔒 Auth & RBAC (JWT / OAuth / OTP)"]
        PARSER["📄 Resume & File Parser"]
        NOTIF["🔔 Notification Engine (Email / Push)"]
    end

    %% Persistence Layer
    subgraph Database ["Persistence Layer"]
        DB[(🗄️ MySQL / PostgreSQL / Supabase)]
        STORAGE["📦 Cloud Storage (S3 / Local Object Store)"]
    end

    %% AI Core Layer
    subgraph AIService ["AI Processing Engine"]
        ROUTER["🔀 AI Provider Router"]
        CLOUD["☁️ Cloud LLMs (OpenAI / Gemini / Claude)"]
        LOCAL["🏠 Local LLMs (Ollama / LocalAI / vLLM)"]
    end

    %% Connections
    WA -->|HTTPS / JSON| API
    MA -->|HTTPS / JSON| API

    API --> AUTH
    API --> PARSER
    API --> NOTIF

    API -->|ORM / SQL Query| DB
    PARSER -->|Save Files| STORAGE

    API --> ROUTER
    ROUTER -->|API Token| CLOUD
    ROUTER -->|Self-Hosted HTTP| LOCAL
```

---

## 💻 Portals & Capabilities

### 👨‍🎓 Candidate Portal

Empowers job seekers with AI-driven insights, resume optimization tools, and instant job applications.

- 🔑 **Authentication**: Standard Email/Password registration, Google OAuth 2.0, and 6-digit OTP email verification for password resets.
- 📄 **Resume Upload & Parsing**: Multiformat upload (PDF/DOCX) with automatic section extraction (Experience, Education, Skills, Projects).
- 📊 **ATS Score Analysis**: Detailed score breakdowns evaluating keyword density, formatting compliance, and impact metrics.
- 🎯 **Job Description Tailoring**: Target resume tailoring against specific job listings to maximize interview callbacks.
- 💡 **AI Suggestions & Skill Gap Analysis**: Identifies missing competencies and recommends targeted courses and certifications.
- 📜 **Version Control & History**: Keep track of multiple tailored resume revisions with one-click restore and download.
- 🎨 **LaTeX & Interactive Resume Editor**: Live web editor with real-time preview, ATS template switching, and LaTeX code export.
- 🔍 **Smart Job Match**: Intelligent job search with location/salary filters, instant apply, and application status tracking.
- 🌙 **Personalization**: Saved login accounts, dark/light theme toggle, and notification preferences.

### 💼 Recruiter Portal

Provides talent acquisition teams with end-to-end recruitment management tools.

- 🏢 **Company Profile**: Create and manage verified corporate profiles with branding and team member access.
- 📢 **Job Posting & Lifecycle**: Draft, publish, edit, deactivate, or archive job postings with structured skill requirements.
- 📑 **Applicant Pipeline**: Board and list views of incoming candidate applications categorized by stage (Applied, Shortlisted, Interviewing, Selected, Rejected).
- 🔍 **Candidate Search & Filter**: Search platform candidates by skills, ATS score, location, and experience level.
- 👁️ **Resume Preview & Download**: Instant in-app PDF previewing and batch download of applicant resumes.
- 📊 **Recruitment Analytics**: Real-time dashboards visualizing candidate funnels, conversion rates, and time-to-hire metrics.
- 🔔 **Instant Alerts**: Automated notifications when top-tier candidates apply or when status changes occur.

### 🛡️ Admin Portal

Ensures system health, user compliance, and global platform control.

- 🔒 **Role-Based Governance**: Secure admin authentication with fine-grained action auditing.
- 👥 **User Management**: Search, suspend, activate, or remove Candidate accounts with full audit logs.
- 🏢 **Recruiter Verification**: Review and approve company registration requests to prevent fraudulent job postings.
- 💼 **Global Job Moderation**: Monitor and edit platform-wide job listings to ensure quality standards.
- 📈 **System Analytics**: Platform-wide metrics including daily active users, application velocity, and AI API consumption.
- 🔔 **System Broadcasts**: Dispatch platform updates and push notifications to candidates or recruiters.

---

## 🤖 Deep-Dive AI Capabilities

ResumeAI leverages LLM technologies to automate career consulting and resume screening:

```
                  ┌──────────────────────────────────────────────┐
                  │            Candidate Upload (PDF)            │
                  └──────────────────────┬───────────────────────┘
                                         │
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │       Text Extraction & Preprocessing        │
                  └──────────────────────┬───────────────────────┘
                                         │
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │      Structured JSON Schema Conversion       │
                  └──────────────────────┬───────────────────────┘
                                         │
     ┌───────────────────────────────────┼───────────────────────────────────┐
     │                                   │                                   │
     ▼                                   ▼                                   ▼
┌─────────┐                       ┌─────────────┐                     ┌──────────────┐
│   ATS   │                       │ Skill Gap   │                     │ Job Match    │
│ Scoring │                       │ Matrix Gen  │                     │ Indexing     │
└────┬────┘                       └──────┬──────┘                     └──────┬───────┘
     │                                   │                                   │
     └───────────────────────────────────┼───────────────────────────────────┘
                                         │
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │  Actionable Action Suggestions & LaTeX Gen  │
                  └──────────────────────────────────────────────┘
```

1. **ATS Resume Scoring Engine**: Analyzes resume structure, section headers, readability, action verb density, and quantifiable achievements to produce a score from 0-100.
2. **Resume Description Tailoring**: Takes a target Job Description (JD) and rewrites bullet points to match the required competencies without hallucinating experience.
3. **Skill Gap Analysis**: Compares candidate profile skills against market trends and job requirements, outputting missing technical & soft skills.
4. **AI Resume Generation**: Generates clean, professional LaTeX code based on user inputs, compilable to PDF.
5. **Configurable Model Backend**:
   - **Cloud Mode**: Connects via official APIs to OpenAI GPT-4o/GPT-3.5-Turbo, Anthropic Claude, or Google Gemini.
   - **Privacy/Local Mode**: Connects to self-hosted Ollama / vLLM endpoints executing open weights models (e.g., Llama 3, Mistral, Qwen) for air-gapped or zero data-retention environments.

---

## 🛠️ Tech Stack

### Frontend Stack
| Technology | Description | Version |
| :--- | :--- | :--- |
| **React** | Web UI library for candidate, recruiter, and admin portals | v18+ |
| **React Native** | Mobile application framework | v0.72+ |
| **Expo** | Mobile development & build toolchain | SDK 49+ |
| **JavaScript (ES6+)** | Core language logic across web and mobile | ES2022 |
| **HTML5 & CSS3** | Semantic structure, flexbox, grid, custom CSS variables | Latest |

### Backend Stack
| Technology | Description | Version |
| :--- | :--- | :--- |
| **Node.js** | Server-side JavaScript execution environment | v18 LTS |
| **Express.js** | Web application framework for RESTful APIs | v4.x |
| **Multer / pdf-parse** | File upload processing and PDF text extraction | Latest |

### Database & Storage
| Technology | Description | Version |
| :--- | :--- | :--- |
| **MySQL / PostgreSQL** | Relational data persistence | MySQL 8.0 / PG 15 |
| **Supabase** | Cloud Postgres & file storage provider (optional) | Cloud |

### Authentication & Security
| Technology | Description |
| :--- | :--- |
| **JWT (JSON Web Tokens)** | Stateless token-based user authentication |
| **Bcrypt.js** | Salted password hashing algorithm |
| **Google OAuth 2.0** | Social sign-in for seamless onboarding |
| **Nodemailer** | Transports OTP verification emails |

### AI Services
| Engine | Protocol / Model |
| :--- | :--- |
| **Cloud APIs** | OpenAI GPT-4o / GPT-3.5, Google Gemini API |
| **Local LLMs** | Ollama, LocalAI (Llama-3, Mistral-7B) via HTTP |
| **Custom Parsers** | Regex + LLM fallback parsing pipelines |

---

## 📁 Repository Directory Structure

```
ResumeAI/
│
├── 📂 backend/                      # Node.js / Express API Server
│   ├── 📂 src/
│   │   ├── 📂 config/               # Database, Mailer & AI Configs
│   │   ├── 📂 controllers/          # Request Handlers (Auth, Jobs, Resumes)
│   │   ├── 📂 middleware/           # Auth, File Upload & Validation Middlewares
│   │   ├── 📂 models/                # Database Queries & Schemas
│   │   ├── 📂 routes/                # API Route Definitions
│   │   ├── 📂 services/              # Business Logic & AI Integrations
│   │   └── 📂 utils/                 # Helper Functions & Constants
│   ├── .env.example                 # Backend Environment Template
│   ├── package.json                 # Node Backend Dependencies
│   └── server.js                    # Server Entry Point
│
├── 📂 web-app/                      # React Web Application
│   ├── 📂 src/
│   │   ├── 📂 assets/                # Logos, Icons, Images
│   │   ├── 📂 components/            # Reusable UI Components
│   │   ├── 📂 context/               # Global State (Auth, Theme)
│   │   ├── 📂 pages/                 # Candidate, Recruiter & Admin Views
│   │   ├── 📂 services/              # Axios API Service Modules
│   │   └── 📂 styles/                # CSS Stylesheets & Tokens
│   └── package.json                 # Web Frontend Dependencies
│
├── 📂 mobile-app/                   # React Native & Expo Mobile Application
│   ├── 📂 src/
│   │   ├── 📂 api/                   # Mobile API Client Integration
│   │   ├── 📂 components/            # Native Mobile Components
│   │   ├── 📂 navigation/            # React Navigation Drawer & Stack Router
│   │   ├── 📂 screens/               # Screens for Candidate, Recruiter, Admin
│   │   └── 📂 styles/                # Mobile Theme System & Global Styles
│   ├── app.json                     # Expo Configuration Matrix
│   └── package.json                 # Mobile App Dependencies
│
├── 📂 database/                     # Database Scripts & Migrations
│   ├── schema.sql                   # MySQL / PostgreSQL DDL Script
│   └── seeds.sql                    # Initial Demo Data Seed Script
│
├── 📂 docs/                         # System Documentation & API Specs
│   ├── API_DOCUMENTATION.md         # Detailed API Contract Specs
│   └── ARCHITECTURE.md              # System Design Overview
│
├── .gitignore                       # Git Ignored Files List
├── package.json                     # Root Workspace Package Configuration
└── README.md                        # Master Project Documentation
```

---

## 🚀 Quick Start & Installation Guide

### Prerequisites

Ensure you have the following software installed locally:
- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher) or **yarn**
- **MySQL Server** (v8.0+) OR **PostgreSQL** (v15+) OR **Supabase** instance
- **Git**

### Installation Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/VishnuPalagiri21/Resume-AI-APP.git
   cd Resume-AI-APP
   ```

2. **Setup Database**
   Import the database schema into your MySQL/PostgreSQL server:
   ```bash
   mysql -u root -p < database/schema.sql
   ```

3. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

4. **Install Web Application Dependencies**
   ```bash
   cd ../web-app
   npm install
   ```

5. **Install Mobile Application Dependencies**
   ```bash
   cd ../mobile-app
   npm install
   ```

---

## 🔑 Environment Variables

Create a `.env` file in the `backend/` directory based on the template below:

```env
# -----------------------------------------------------------------------------
# SERVER CONFIGURATION
# -----------------------------------------------------------------------------
PORT=5000
NODE_ENV=development

# -----------------------------------------------------------------------------
# SECURITY & AUTHENTICATION
# -----------------------------------------------------------------------------
JWT_SECRET=super_secret_jwt_key_change_in_production_12345
JWT_EXPIRES_IN=7d

# -----------------------------------------------------------------------------
# DATABASE CONFIGURATION
# -----------------------------------------------------------------------------
# Standard Relational Connection String
DATABASE_URL=mysql://root:password@localhost:3306/resume_ai_db

# Supabase Integration (Optional)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key

# -----------------------------------------------------------------------------
# EMAIL / OTP SERVICE (Nodemailer)
# -----------------------------------------------------------------------------
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password

# -----------------------------------------------------------------------------
# GOOGLE OAUTH
# -----------------------------------------------------------------------------
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# -----------------------------------------------------------------------------
# AI SERVICE PROVIDERS
# -----------------------------------------------------------------------------
# Cloud LLM Provider (OpenAI / Gemini)
OPENAI_API_KEY=sk-proj-your-openai-api-key

# Local LLM Provider (Ollama / LocalAI)
LOCAL_MODEL_URL=http://localhost:11434
USE_LOCAL_AI=false
```

### Environment Variable Glossary

| Variable | Required | Description |
| :--- | :---: | :--- |
| `PORT` | Yes | Port number on which Express server operates (Default: 5000) |
| `JWT_SECRET` | Yes | Encryption secret key used for signing JWT tokens |
| `DATABASE_URL` | Yes | Connection URI for the database engine |
| `EMAIL_USER` | Yes | SMTP sender address for dispatching OTP verification emails |
| `EMAIL_PASSWORD` | Yes | SMTP app password / API credential |
| `GOOGLE_CLIENT_ID` | Optional | Client ID for Google Social Sign-In |
| `GOOGLE_CLIENT_SECRET` | Optional | Client secret for Google OAuth authorization server |
| `OPENAI_API_KEY` | Optional | API Key for OpenAI models |
| `LOCAL_MODEL_URL` | Optional | Endpoint URL for locally hosted LLM instances |
| `SUPABASE_URL` | Optional | Project URL for Supabase integration |
| `SUPABASE_KEY` | Optional | Anon API key for Supabase access |

---

## 🏃 Running the Platform

You can launch all parts of the application using individual terminals or workspace commands.

### 1. Launch Backend API
```bash
cd backend
npm run dev
```
*Backend will start on `http://localhost:5000`*

### 2. Launch Web Application
```bash
cd web-app
npm start
```
*Web application will start on `http://localhost:3000`*

### 3. Launch Mobile Application
```bash
cd mobile-app
npx expo start
```
*Press `a` to open Android Emulator, `i` for iOS Simulator, or scan the QR code using the **Expo Go** mobile app.*

---

## 📡 API Architecture & Documentation

The backend exposes a structured, RESTful API endpoint suite:

<details>
<summary><strong>🔐 1. Authentication Endpoints</strong></summary>

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Register new Candidate / Recruiter | ❌ |
| `POST` | `/api/auth/login` | Authenticate user & return JWT token | ❌ |
| `POST` | `/api/auth/google` | Authenticate via Google OAuth token | ❌ |
| `POST` | `/api/auth/forgot-password` | Request password reset OTP email | ❌ |
| `POST` | `/api/auth/verify-otp` | Validate 6-digit OTP code | ❌ |
| `POST` | `/api/auth/reset-password` | Reset password using verified token | ❌ |

</details>

<details>
<summary><strong>👨‍🎓 2. Candidate & Resume Endpoints</strong></summary>

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/users/profile` | Fetch authenticated user profile | ✅ |
| `POST` | `/api/resumes/upload` | Upload & parse PDF/DOCX resume | ✅ |
| `POST` | `/api/resumes/analyze` | Perform ATS analysis on resume | ✅ |
| `POST` | `/api/resumes/tailor` | Tailor resume to target Job Description | ✅ |
| `GET` | `/api/resumes/history` | Retrieve saved resume versions | ✅ |
| `POST` | `/api/resumes/generate-latex` | Generate LaTeX code for resume | ✅ |

</details>

<details>
<summary><strong>💼 3. Recruiter & Job Endpoints</strong></summary>

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/jobs` | Create a new job listing | ✅ (Recruiter) |
| `GET` | `/api/jobs` | List active job postings with filters | ❌ |
| `GET` | `/api/jobs/:id` | Get detailed job specs | ❌ |
| `PUT` | `/api/jobs/:id` | Update existing job posting | ✅ (Recruiter) |
| `DELETE` | `/api/jobs/:id` | Archive or delete job listing | ✅ (Recruiter) |
| `GET` | `/api/jobs/:id/applicants` | View candidate applications for a job | ✅ (Recruiter) |

</details>

<details>
<summary><strong>🛡️ 4. Admin & Governance Endpoints</strong></summary>

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/admin/stats` | Platform KPIs & resource telemetry | ✅ (Admin) |
| `GET` | `/api/admin/users` | List all platform candidate accounts | ✅ (Admin) |
| `PATCH` | `/api/admin/recruiters/:id` | Approve or revoke recruiter access | ✅ (Admin) |
| `DELETE` | `/api/admin/jobs/:id` | Moderate/remove non-compliant job | ✅ (Admin) |

</details>

---

## 🗄️ Database Schema & Entities

The relational database architecture is designed for performance, scaling, and integrity:

```
+------------------+         +--------------------+         +-------------------+
|      Users       |         |     Recruiters     |         |       Jobs        |
+------------------+         +--------------------+         +-------------------+
| id (PK)          |<--------| id (PK)            |<--------| id (PK)           |
| email            |         | user_id (FK)       |         | recruiter_id (FK) |
| password_hash    |         | company_name       |         | title             |
| role             |         | verification_status|         | description       |
+--------┬---------+         +--------------------+         +---------┬---------+
         │                                                            │
         │                   +--------------------+                   │
         ├──────────────────>|      Resumes       |                   │
         │                   +--------------------+                   │
         │                   | id (PK)            |                   │
         │                   | user_id (FK)       |                   │
         │                   | parsed_json        |                   │
         │                   +---------┬----------+                   │
         │                             │                              │
         │                             ▼                              │
         │                   +--------------------+                   │
         │                   |    Applications    |<──────────────────┘
         │                   +--------------------+
         └──────────────────>| id (PK)            |
                             | job_id (FK)        |
                             | candidate_id (FK)  |
                             | resume_id (FK)     |
                             | status             |
                             +--------------------+
```

### Key Entity Descriptions

- **Users**: Central identity table holding credentials, OAuth IDs, roles (`candidate`, `recruiter`, `admin`), and profile metadata.
- **Recruiters**: Extended profile table for corporate users containing company data and verification flags.
- **Jobs**: Represents open career opportunities posted by recruiters with skills array, salary ranges, and location.
- **Resumes**: Stores candidate resume files, text extractions, and parsed JSON payload structures.
- **Applications**: Tracks job application instances, current candidate pipeline status, and audit timestamps.
- **ResumeHistory**: Version-controlled table preserving historical iterations of tailored resumes.
- **Notifications**: System alerts for application status updates, messages, and administrative announcements.

---

## 📸 Application Screenshots

*(Placeholders provided for visually demonstrating the UI portals across Web and Mobile)*

| Candidate Portal Dashboard | Recruiter Portal Management |
| :---: | :---: |
| ![Candidate Portal Placeholder](https://via.placeholder.com/600x350/1E293B/FFFFFF?text=Candidate+Portal+Dashboard) | ![Recruiter Portal Placeholder](https://via.placeholder.com/600x350/0F172A/FFFFFF?text=Recruiter+Dashboard) |

| AI ATS Resume Analysis | Mobile App Interface |
| :---: | :---: |
| ![ATS Analysis Placeholder](https://via.placeholder.com/600x350/334155/FFFFFF?text=ATS+Resume+Analysis+%26+Score) | ![Mobile Screen Placeholder](https://via.placeholder.com/300x550/0284C7/FFFFFF?text=Mobile+App+Screen) |

---

## 🌐 Deployment Blueprint

### 1. Web Application (Vercel)
The React web application can be deployed directly to Vercel:
```bash
npm run build --prefix web-app
vercel --prod
```

### 2. Backend API (Render / Railway)
Deploy the Node.js Express server to Render or Railway by setting environment variables in the dashboard and setting the start command:
```bash
npm start --prefix backend
```

### 3. Database Cloud Instance (Supabase / Aiven)
Provision a managed PostgreSQL/MySQL database instance on Supabase or Aiven, and update `DATABASE_URL` in your backend environment configuration.

### 4. Mobile Application (Expo EAS)
Build Android APK/AAB and iOS IPA bundles using Expo Application Services:
```bash
cd mobile-app
# Build Android APK
eas build --platform android --profile preview

# Build for App Store / Play Store Release
eas build --platform all
```

---

## 🔒 Security & Compliance

ResumeAI is built following industry security standards:
- **Authentication**: JWT tokens signed with secure secrets and strict expiration windows.
- **Data Encryption**: Salted password hashing via `bcrypt.js` (cost factor 10+).
- **Verification**: Email OTP verification enforcing short life cycles for password recovery.
- **Role-Based Access Control (RBAC)**: Middleware enforcing role-specific permission checks on every API route.
- **Sanitization**: SQL parameterization and input sanitization to prevent SQL injection and XSS attacks.

---

## ⚡ Performance Optimizations

- **Dynamic Code Splitting**: React components lazy-loaded via `React.lazy()` and `Suspense` to reduce initial bundle size.
- **Database Indexing**: Strategic indexing on foreign keys (`user_id`, `job_id`, `recruiter_id`) for sub-millisecond query execution.
- **Asynchronous AI Processing**: Heavy resume parsing and LLM API requests executed asynchronously without blocking HTTP response threads.
- **Asset Optimization**: Compression of mobile image assets and lazy render of long candidate list views using React Native `FlatList`.

---

## 🔮 Future Roadmap

- [ ] **AI Video Interview Simulator**: Automated mock interview module with real-time feedback.
- [ ] **Candidate Resume Benchmarking**: Compare applicant profiles against top 10% industry performers.
- [ ] **AI Career Guidance & Salary Predictor**: Machine learning estimates for candidate market value based on skill metrics.
- [ ] **Multilingual Resume Processing**: Support for parsing and tailoring non-English resumes.
- [ ] **Enterprise ATS Integration**: Connect with Greenhouse, Lever, and Workday APIs.

---

## 🤝 Contributing Guidelines

Contributions are welcome! Please follow these steps to contribute:

1. **Fork the Repository**
2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit your Changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **Push to the Branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open a Pull Request**

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

## 👨‍💻 Authors & Credits

- **Vishnu Palagiri** — *Lead Architect & Engineer* — [GitHub](https://github.com/VishnuPalagiri21)

---

## 🙏 Acknowledgements

- [React](https://react.dev/) & [React Native](https://reactnative.dev/)
- [Expo Framework](https://expo.dev/)
- [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/)
- [OpenAI API](https://openai.com/)
- [Ollama Community](https://ollama.com/)
- [Mermaid Diagrams](https://mermaid.js.org/)
