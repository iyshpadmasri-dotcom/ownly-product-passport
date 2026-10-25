# Ownly — Digital Product Passport & Circular Economy Platform

> **Tagline:** *"Everything you own, all in one place."*  
> **Core Concept:** *"A Product's History Shouldn't End When Its Owner Changes."*

Ownly is a clean, friendly, consumer-centric digital product passport platform. It enables everyday people to organize their product records, store purchase bills and warranty documents, track maintenance and repair timelines, generate verified shareable dossiers, transfer ownership with mutual consent, and explore responsible next steps (sell, repair, donate, recycle) across the circular economy.

---

## 🌟 Key Features

* **LifeTrace™ (Provenance & History Continuity):** An unbroken chronological timeline of purchases, maintenance, and transfers. Clearly distinguishes between *Verified Transfer*, *Document-Supported*, and *Self-Reported* events while preserving previous owners' private data.
* **Secure Ownership Transfer:** Two-sided consent workflow. The current owner initiates a transfer request; the recipient reviews the permitted history and documents and explicitly accepts or declines.
* **TrustCheck™ (Category-Specific Condition Assessment):** Evidence-aware diagnostic checklists specifically tailored for Smartphones, Laptops, Vehicles, Appliances, Furniture, and Audio gear.
* **ProofPack™ (Shareable Digital Dossier):** Instant tokenized public web links (`/proofpack/:token`) with granular privacy toggles and strict redaction of sensitive identifiers (IMEIs/serial numbers). Includes a print/PDF-optimized layout.
* **SecondLife™ (Circular Economy Guidance):** Four clear actions on every passport: *Sell* on marketplace, *Repair* at authorized centers, *Donate* to community causes, or *Recycle* e-waste responsibly.
* **India-First Localization 🇮🇳:** Full Indian Rupee (`₹` via `en-IN`), Indian date standards (`DD/MM/YYYY`), Indian states & cities, and popular Indian retail stores (Amazon India, Flipkart, Croma, Reliance Digital, etc.).

---

## 🎨 Design Philosophy & Visual Identity

* **Inspiration:** The simplicity of Apple, the friendliness of Notion, and the browsing experience of a modern shopping marketplace.
* **Warm Ivory Background:** `#FAF8F4`
* **Charcoal Text:** `#292725`
* **Muted Lavender Accent:** `#A99AE8`
* **Soft Coral Accent:** `#F2A995`
* **Cards:** `#FFFFFF` with subtle shadows and rounded corners (`16px`)
* **Simplicity First:** Friendly consumer feel, zero technical jargon, clear feedback on every action, and responsive layouts across mobile, tablet, and desktop.

---

## 🛠️ Technology Stack

* **Frontend:**
  * React.js (Vite)
  * React Router v7
  * Lucide React Icons
  * Axios
  * CSS3 Custom Properties Design System

* **Backend:**
  * Node.js & Express.js
  * REST API Architecture
  * JWT Authentication & BCrypt Password Hashing
  * Multer (local and cloud file storage)
  * Privacy isolation middleware

* **Database & ORM:**
  * Prisma ORM
  * SQLite for instant, zero-setup local execution (`backend/prisma/schema.prisma`)
  * PostgreSQL production schema included (`backend/prisma/schema.postgresql.prisma`)

---

## 🚀 Getting Started Locally

### 1. Prerequisites
* Node.js (v18+)
* npm
* Git

### 2. Install Dependencies
From the root directory:
```bash
# Install root, backend, and frontend dependencies
npm run install:all
```

Or individually:
```bash
cd backend && npm install
cd ../frontend && npm install
```

### 3. Initialize & Seed Database
```bash
cd backend
npm run prisma:push
npm run prisma:seed
```

*Demo accounts seeded:*
* **Sarah Jenkins (Owner):** `demo@ownly.app` | Password: `password123`
* **Alex Rivera (Recipient / Buyer):** `alex@ownly.app` | Password: `password123`

### 4. Run Both Services
From the root directory:
```bash
node start.js
```
Or in two separate terminals:
* **Backend:** `cd backend && npm run dev` (Runs on `http://localhost:5000`)
* **Frontend:** `cd frontend && npm run dev` (Runs on `http://localhost:5173`)

Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 🐘 Switching to PostgreSQL for Production

1. In `backend/.env`, set your PostgreSQL connection string:
   ```env
   DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/ownly_db?schema=public"
   ```

2. Replace the datasource in `backend/prisma/schema.prisma` with `backend/prisma/schema.postgresql.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

3. Run migrations and seed:
   ```bash
   npx prisma migrate dev --name init
   node prisma/seed.js
   ```

---

## 📄 License
MIT © 2026 Ownly Inc.
