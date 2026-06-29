# 🚀 AGRILYS SaaS Platform - Multi-Tenant Template

**Version:** 1.0.0 (Template Vierge)  
**Status:** ✅ Ready for new clients  
**License:** MIT

---

## 📋 À Propos

Ce repository est le **template vierge** pour la plateforme AGRILYS SaaS multi-locataires. Il contient :

- ✅ **Architecture complète** (Frontend React + TypeScript, Backend Node.js APIs)
- ✅ **Configuration .env** (Prête pour customisation par client)
- ✅ **Structure modulaire** (Facile à adapter)
- ✅ **Aucune donnée client** (Complètement vierge)
- ✅ **Prêt pour production** (Vercel deployment ready)

---

## 🎯 Usage

### Pour un Nouveau Client

1. **Cloner ce repository**
   ```bash
   git clone https://github.com/elhamdiomar6-ui/agrilys-saas-template.git <nom-client>
   cd <nom-client>
   ```

2. **Configurer `.env`**
   ```bash
   cp .env.example .env
   # Remplir avec les infos du client
   ```

3. **Installer et lancer**
   ```bash
   npm install
   npm run dev
   ```

4. **Déployer**
   ```bash
   vercel --prod
   ```

---

## 🏗️ Structure

```
agrilys-saas-template/
├── src/                      # React frontend (TypeScript)
│   ├── components/           # Reusable components
│   ├── pages/               # Page components
│   ├── data/                # Client data (EMPTY in template)
│   ├── lib/                 # Utilities
│   ├── hooks/               # Custom React hooks
│   ├── config/              # Configuration (uses .env)
│   └── styles/              # CSS
├── api/                      # Backend APIs (Vercel Functions)
│   ├── orchid/              # ORCHID TTS service
│   └── habitants/           # Resident management
├── public/                   # Static assets
├── .env.example             # Environment template
├── vercel.json              # Vercel deployment config
├── package.json             # Dependencies
└── tsconfig.json            # TypeScript config
```

---

## 🔧 Configuration Requise

### Variables `.env` (Obligatoires pour chaque client)

```bash
# Organization
VITE_ASSOCIATION_SLUG=<client-slug>
VITE_ASSOCIATION_NAME=<client-name>
VITE_ASSOCIATION_FULL_NAME=<full-legal-name>

# Contacts
VITE_OFFICIAL_EMAIL=<client-email>
VITE_GENERAL_PHONE=<client-phone>
VITE_PUBLIC_APP_URL=<client-domain>

# Leadership
VITE_PRESIDENT_NAME=<president>
VITE_PRESIDENT_EMAIL=<president-email>
VITE_PRESIDENT_PHONE=<president-phone>

# Storage
VITE_STORAGE_PREFIX=<storage-key-prefix>
```

Voir `.env.example` pour la liste complète.

---

## 📦 Features

### Frontend
- ✅ React 18 + TypeScript
- ✅ Vite bundler
- ✅ Multi-language (FR/AR) + RTL
- ✅ Responsive design
- ✅ localStorage persistence
- ✅ Real-time dashboard

### Backend APIs
- ✅ Vercel Functions (Serverless)
- ✅ ORCHID TTS (speech synthesis Darija)
- ✅ Resident registration system
- ✅ Data export/import

### Deployment
- ✅ Vercel ready (one-click deploy)
- ✅ GitHub integration
- ✅ Custom domains
- ✅ SSL/TLS included

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Development server
npm run dev
# Open http://localhost:5173

# Production build
npm run build

# Deploy to Vercel
vercel --prod
```

---

## 📚 Documentation

- **Configuration:** See `.env.example` and `src/config/site.ts`
- **Architecture:** See `ARCHITECTURE.md` (to be created per client)
- **API Reference:** See `api/` folder

---

## 🔐 Security Notes

- **No sensitive data** in repository
- **Environment variables** for all client-specific config
- **GitHub secrets** recommended for production
- **SSL/TLS** via Vercel (automatic)

---

## 📞 Support

For AGRILYS clients:
- Email: support@agrilys.sarlau
- Documentation: https://agrilys-docs.example.com

---

## 📄 License

MIT License - See LICENSE file

---

**Template Version:** 1.0.0  
**Last Updated:** 2026-06-29  
**Maintainer:** AGRILYS SARLAU

---

*Ce template vierge est conçu pour être clôné et personnalisé pour chaque nouveau client AGRILYS.*
