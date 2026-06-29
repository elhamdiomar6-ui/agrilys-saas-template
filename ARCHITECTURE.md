# 🏗️ Architecture - AGRILYS SaaS Template

**Version:** 1.0.0  
**Status:** Documentation  
**Last Updated:** 2026-06-29

---

## 📊 Vue d'Ensemble

```
┌─────────────────────────────────────────────────────────┐
│           AGRILYS SaaS Multi-Tenant Platform            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Frontend (React)          Backend (Node.js)            │
│  ├─ Components             ├─ API Routes               │
│  ├─ Pages                  ├─ ORCHID TTS               │
│  ├─ Config (.env)          ├─ Data Processing          │
│  └─ Hooks/Utils            └─ File Export/Import       │
│                                                         │
│         ↓↓↓  Vercel Deployment  ↓↓↓                    │
│  ├─ Frontend (dist/)                                    │
│  ├─ Serverless Functions (api/)                        │
│  └─ Custom Domain Support                              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 Dossiers & Fichiers

### **1. `/src` - Frontend (React)**

```
src/
├── components/              # Composants réutilisables
│   ├── AudioHelp.tsx       # Aide audio contextuelle
│   ├── CardListenButton.tsx # Bouton lecture audio
│   ├── ExportCotisation.tsx # Export données
│   ├── AgadirHistory.tsx    # Historique (client-specific)
│   └── ... (autres composants)
│
├── pages/                   # Pages complètes (router)
│   ├── public/
│   │   ├── HomePage.tsx     # Page d'accueil
│   │   └── InscriptionPage.tsx # Inscription
│   ├── habitant/            # Espace résident
│   ├── bureau/              # Espace bureau/admin
│   ├── president/           # Espace président
│   └── BureauDossiersStrategiques.tsx
│
├── data/                    # Données locales (à adapter par client)
│   ├── agriculture.ts       # Données agricoles
│   ├── cooperatives.ts      # Données coopératives
│   ├── members.ts           # Membres
│   ├── announcements.ts     # Annonces
│   ├── events.ts            # Événements
│   ├── strategicDossiers.ts # (NOUVEAU) Dossiers bailleurs
│   └── ... (autres données)
│
├── hooks/                   # Custom React Hooks
│   ├── useInscriptionsBadge.ts
│   └── ... (autres hooks)
│
├── lib/                     # Utilities et helpers
│   ├── agadirHistoryContent.ts # Contenu histoire (adaptable)
│   ├── habitants.ts         # Logique résidents
│   ├── storage/             # localStorage helpers
│   └── ... (autres utils)
│
├── config/                  # Configuration (CLÉS!)
│   ├── site.ts             # ⭐ Configuration globale (uses .env)
│   ├── storageKeys.ts      # Clés localStorage
│   └── permissions.ts      # Contrôle d'accès
│
├── styles/                  # CSS
│   ├── styles.css
│   └── ... (autres styles)
│
├── App.tsx                  # App component principal
├── main.tsx                 # Entry point React
└── types.ts                 # TypeScript types globaux
```

### **2. `/api` - Backend (Vercel Functions)**

```
api/
├── orchid/                  # ORCHID TTS Service
│   ├── tts.ts              # Text-to-Speech endpoint
│   ├── chat.ts             # Chat avec TTS
│   └── ... (orchestration)
│
├── habitants/              # Resident Management
│   ├── inscription.ts       # Registration endpoint
│   ├── approval.ts          # Approval workflow
│   └── ... (resident APIs)
│
└── (autres endpoints au besoin)
```

### **3. Fichiers Configuration**

```
Root/
├── .env.example             # ⭐ Template variables (à copier en .env)
├── .env                     # ⭐ Client configuration (IGNORE in git)
├── .gitignore               # Git patterns
├── .vercel/                 # Vercel metadata
│   └── project.json         # Project config (ignore)
│
├── package.json             # Dependencies
├── package-lock.json        # Dependency lock
│
├── tsconfig.json            # TypeScript config
├── tsconfig.node.json       # Node.js TS config
│
├── vite.config.ts           # Vite bundler config
├── vercel.json              # Vercel deployment config
│
├── index.html               # HTML entry point
├── README.md                # Documentation
├── SETUP_NEW_CLIENT.md      # ⭐ Setup guide
└── ARCHITECTURE.md          # This file
```

### **4. `/public` - Static Assets**

```
public/
├── robots.txt               # SEO
├── sitemap.xml              # SEO
├── favicon.ico              # Icon
├── audio/                   # Audio files
│   ├── darija/             # Darija recordings
│   ├── arabic/             # Arabic recordings
│   └── french/             # French recordings
└── ... (autres assets)
```

---

## 🔄 Data Flow

### **Frontend → Backend → Frontend**

```
1. User Input (React Component)
   ↓
2. Event Handler (onClick, onChange)
   ↓
3. API Call (fetch/axios to /api/*)
   ↓
4. Vercel Function (Node.js)
   ↓
5. Process Data
   ↓
6. Response (JSON)
   ↓
7. Update State (useState)
   ↓
8. Re-render Component
```

### **Contenu Statique (Hardcoded Data)**

```
Data File (src/data/*.ts)
   ↓
Export as Array/Object
   ↓
Import in Component
   ↓
map() or filter()
   ↓
Render (JSX)
```

---

## ⚙️ Configuration & Environment

### **Où Customizer par Client**

#### **1. `.env` (OBLIGATOIRE)**
```bash
# Client-specific variables
VITE_ASSOCIATION_SLUG=my-client
VITE_ASSOCIATION_NAME=MY CLIENT
VITE_OFFICIAL_EMAIL=contact@myclient.org
# ... etc
```
**Utilisé dans:** `src/config/site.ts` → tous les composants

#### **2. `src/config/site.ts` (Lire pour comprendre)**
```typescript
export const siteConfig = {
  slug: import.meta.env.VITE_ASSOCIATION_SLUG || 'default',
  name: import.meta.env.VITE_ASSOCIATION_NAME || 'Default',
  // ... autres variables
};
```
**Référencé par:** Tous les composants via `import { siteConfig }`

#### **3. `src/data/*.ts` (Client Data)**
```typescript
// Exemple: src/data/announcements.ts
export const defaultAnnouncements = [
  {
    id: 'ann-1',
    title: 'Annonce 1',
    // ... client-specific data
  },
];
```
**Utilisé par:** Pages, composants

---

## 🔐 Configuration Hierachy

### **Priority Order (highest → lowest)**

```
1. Environment Variables (.env)          ← Override tout
   VITE_ASSOCIATION_SLUG=myclient
   
2. siteConfig (src/config/site.ts)       ← Defaults fallback
   slug: import.meta.env.VITE_ASSOCIATION_SLUG || 'agadirnetguida'
   
3. Hardcoded Values (data files)         ← Last resort
   defaultAnnouncements = [ ... ]
```

---

## 📦 Dependencies

### **Frontend**
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Bundler (fast)
- **lucide-react** - Icons
- **html2pdf** - PDF export
- **papaparse** - CSV parsing

### **Backend**
- **Node.js** - Runtime (Vercel)
- **TypeScript** - Type safety
- **reportlab** (Python) - PDF generation

### **Services**
- **ORCHID** - Text-to-speech (Darija/Arabic/French)
- **localStorage** - Client-side persistence

---

## 🚀 Deployment Flow

### **Development**
```bash
npm run dev
# → Vite dev server on localhost:5173
```

### **Production Build**
```bash
npm run build
# → TypeScript check + Vite bundle
# → Output: dist/ folder
```

### **Deployment to Vercel**
```bash
vercel --prod
# → Upload dist/ (frontend)
# → Upload api/ (serverless functions)
# → Assign custom domain
```

---

## 🔑 Key Files to Understand

### **Essential**
- **`.env.example`** - All available variables
- **`src/config/site.ts`** - How variables are used
- **`src/App.tsx`** - Route definitions
- **`src/pages/*/`** - Page components

### **Important for Customization**
- **`src/data/`** - Client-specific data
- **`api/`** - Backend logic
- **`public/audio/`** - Audio files

### **Reference Only**
- **`src/lib/agadirHistoryContent.ts`** - History narrative (client-specific)
- **`src/hooks/`** - Utilities
- **`src/styles/`** - CSS

---

## 🔄 Multi-Tenant Design

### **Single Codebase, Multiple Clients**

```
agrilys-saas-template/          ← Template vierge (ce repo)
├── [Clone for Client 1]        ← client-1 instance
│   ├── .env                    ← Client 1 config
│   ├── src/data/               ← Client 1 data
│   └── GitHub repo: client-1
│
└── [Clone for Client 2]        ← client-2 instance
    ├── .env                    ← Client 2 config
    ├── src/data/               ← Client 2 data
    └── GitHub repo: client-2
```

### **Per-Client Customization**

| Item | Template | Client Instance |
|------|----------|-----------------|
| Code Structure | ✅ Partagé | ❌ Copy unique |
| `.env` | example | ✅ Customisé |
| `src/data/` | Vierge/templates | ✅ Rempli |
| `src/lib/agadirHistoryContent.ts` | Example | ✅ Customisé |
| Styling | Common | ✅ Adaptable |

---

## 📈 Scaling & Optimization

### **For More Clients**

1. **Keep Template Updated**
   - New features → Apply to template
   - Bug fixes → Apply to template
   - Template → Clients via new clone

2. **Shared Libraries (Future)**
   ```
   agrilys-shared/              ← Shared packages
   ├── @agrilys/ui-components
   ├── @agrilys/hooks
   └── @agrilys/utils
   ```

3. **Monorepo (Future)**
   ```
   agrilys-monorepo/
   ├── template/
   ├── client-1/
   ├── client-2/
   └── packages/
   ```

---

## 🎯 Best Practices

### **DO ✅**
- Use environment variables for client config
- Keep template generic (no client-specific code)
- Update template regularly
- Document client customizations
- Use git branches for features

### **DON'T ❌**
- Hardcode client-specific values
- Mix clients in same repo
- Forget to update .gitignore
- Commit `.env` file
- Modify template in client instances

---

## 📞 Questions?

- **Variables?** → Check `.env.example`
- **Structure?** → Read this document
- **Setup?** → See `SETUP_NEW_CLIENT.md`
- **Code?** → Read source files + comments

---

**AGRILYS SaaS Platform v1.0.0**  
*Multi-tenant, production-ready, easily customizable*
