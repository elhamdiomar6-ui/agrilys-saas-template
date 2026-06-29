# 🗺️ Cartographie des Clients AGRILYS

**Version:** 1.0.0  
**Date:** 2026-06-29  
**Statut:** Documentation de référence

---

## 🏢 Structure AGRILYS

```
AGRILYS SARLAU (Entreprise)
    │
    ├── agrilys-saas-template/          ← Repository Template (vierge)
    │   │   Branche: main
    │   │   Description: Template multi-tenant vierge
    │   │   Usage: Clone pour chaque nouveau client
    │   │
    │   └── Contient:
    │       ├── Code source (frontend + APIs)
    │       ├── Configuration (.env.example)
    │       ├── Documentation (SETUP, ARCHITECTURE)
    │       └── AUCUNE donnée client
    │
    └── Client Instances:
        │
        ├── agadirnetguida/             ← CLIENT #1: ANATDC
        │   │   Branche: main
        │   │   Repository Owner: elhamdiomar6-ui
        │   │   URL: https://app.agadirnetguida.com
        │   │   .env: ANATDC-specific
        │   │
        │   └── Customisé pour:
        │       ├── Organisation: ANATDC (Assoc. Agadir N'Tguida)
        │       ├── Domaine: agadirnetguida.com
        │       ├── Données: Grenier Collectif, Douar Agadir N'Tguida
        │       ├── Personne: Omar El Hamdi (Président)
        │       └── Prospect bailleurs: 99+ (Phase 1-3 2026)
        │
        ├── client-2/                   ← CLIENT #2: À créer
        │   .env: Client-2 specific
        │   (Clonage du template)
        │
        └── ... (futurs clients)
```

---

## 📊 Comparaison: Template vs Clients

| Aspect | Template | Client Instance |
|--------|----------|-----------------|
| **Repository** | agrilys-saas-template | client-name |
| **Branch** | main | main + feature branches |
| **Code** | ✅ Partagé | ✅ Copie unique |
| **`.env.example`** | ✅ Générique | ✅ Référence |
| **`.env`** | ❌ N/A | ✅ Client-specific |
| **`src/data/`** | ⚪ Minimal/example | ✅ Client data |
| **`src/lib/agadirHistoryContent.ts`** | Example content | ✅ Client narrative |
| **GitHub Repo** | Public template | Client repo |
| **Domain** | N/A | client.agrilys.app |
| **Vercel** | N/A | Client deployment |

---

## 🎯 Client #1: ANATDC

### **Informations Générales**
```
Nom: Association Agadir N'Tguida pour le Développement et la Coopération
Sigle: ANATDC
Acronyme: ANATDC
Statut Légal: Dahir 1.58.376
Localisation: Douar Agadir N'Tguida, Sidi Ifni, Anti-Atlas, Maroc
Population: <500 habitants
```

### **Infrastructure Numérique**
```
Repository Git: agadirnetguida
GitHub: https://github.com/elhamdiomar6-ui/agadirnetguida
Domaine: agadirnetguida.com
App URL: https://app.agadirnetguida.com
Vercel Project: registre-communautaire-douar
```

### **Contacts**
```
Président: Omar El Hamdi
Email: agadirnetguida.asso@gmail.com
Téléphone: +212 662 425 007
Contact Admin: agadirnetguida.asso@gmail.com
```

### **Données Principales**
```
Heritage: Grenier Collectif (Agadir) Tguida
   - Monument Historique National (Mars 2026)
   - Patrimoine Immatériel Amazigh
   - UNESCO ICH-09 (candidature)
   - ONU iCSO/DESA 2026

Résidents: <500 habitants
   - Non bancarisés
   - Sans accès eau courante
   - Sans école locale
   - Connexion mobile fragile

Plateforme: App Agadir N'Tguida
   - Interface audio en Darija
   - Fonctionnement offline
   - Gouvernance transparente
   - Documentation patrimoine
```

### **Prospection Bailleurs (Phase 1-3 2026)**
```
Tier 1 (HAUTE - Immediate):    15 bailleurs (30 juin - 14 juillet)
Tier 2 (MOYENNE - Phase 2):    52 bailleurs (1 août - 30 sept)
Tier 3 (FAIBLE - Phase 3):     31 bailleurs (octobre+)
Total: 99 bailleurs internationaux

Target Revenue: 450k - 1M+ DH (6 mois)
```

### **Fonctionnalités Activées**
```
✅ Public Homepage
✅ Resident Registration System
✅ Bureau/Admin Dashboard
✅ Inhabitant Portal
✅ ORCHID TTS (Darija)
✅ Strategic Dossiers (Email Tracking)
✅ Data Export/Import
✅ Multi-language (FR/AR/Darija)
```

### **Code Spécifique à ANATDC**
```
Fichiers avec données ANATDC:
- src/data/*.ts (announcements, events, etc.)
- src/lib/agadirHistoryContent.ts (heritage narrative)
- src/data/strategicDossiers.ts (funders tracking)
- public/audio/darija/* (Darija recordings)
- ... et 40+ autres fichiers
```

---

## 🔄 Workflow: Template → Client Instance

### **Pour Créer un Nouveau Client (ex: Client-2)**

#### **Étape 1: Clone Template**
```bash
git clone https://github.com/elhamdiomar6-ui/agrilys-saas-template.git client-2
cd client-2
```

#### **Étape 2: Configure Client**
```bash
cp .env.example .env
# Éditer .env avec info du Client-2
VITE_ASSOCIATION_SLUG=client-2
VITE_ASSOCIATION_NAME=CLIENT 2 NAME
VITE_OFFICIAL_EMAIL=contact@client2.org
# ... etc
```

#### **Étape 3: Customize Data**
```bash
# Remplacer le contenu des fichiers data/
# Adapter src/lib/agadirHistoryContent.ts
# Ajouter audio darija pour Client-2
```

#### **Étape 4: Create GitHub Repo**
```bash
git remote set-url origin https://github.com/elhamdiomar6-ui/client-2.git
git branch -M main
git push -u origin main
```

#### **Étape 5: Deploy**
```bash
vercel link
vercel env add VITE_ASSOCIATION_SLUG
# ... ajouter toutes les variables
vercel --prod
```

---

## 📈 Evolution Timeline

### **2026 - Phase 1: ANATDC Launch**
- ✅ Template Created
- ✅ ANATDC Instance Deployed
- ✅ Phase 1 Prospection (15 bailleurs, 30 juin)

### **2026 Q3 - Phase 2: Scale**
- ⏳ ANATDC Phase 2 (52 bailleurs, août)
- ⏳ Client #2 Onboarded
- ⏳ Template Refined (bug fixes)

### **2026 Q4 - Phase 3: Expand**
- ⏳ ANATDC Phase 3 (31 bailleurs, oct+)
- ⏳ Client #3-5 Onboarded
- ⏳ Shared Libraries Development

### **2027+: Full SaaS**
- ⏳ Multi-tenant analytics
- ⏳ Shared billing system
- ⏳ White-label options
- ⏳ API marketplace

---

## 🔐 Data Isolation

### **Par Client (Complètement Séparé)**
```
Client-1 (ANATDC):
  - .env → ANATDC-specific
  - src/data/ → ANATDC data
  - localStorage → "agadirnetguida.*"
  - GitHub repo → agadirnetguida
  - Vercel project → registre-communautaire-douar
  - Domain → app.agadirnetguida.com

Client-2:
  - .env → Client-2 specific
  - src/data/ → Client-2 data
  - localStorage → "client-2.*"
  - GitHub repo → client-2
  - Vercel project → client-2
  - Domain → app.client-2.agrilys.app
```

### **Shared (Template)**
```
Code Source (src/, api/)
Configuration Patterns (.env.example)
Documentation (SETUP, ARCHITECTURE)
Frontend Build (Vite)
Backend Functions (Node.js)
```

---

## 🚀 Best Practices

### **Template Management**
- ✅ Keep template clean (no client data)
- ✅ Tag releases (v1.0, v1.1, etc.)
- ✅ Document changes in CHANGELOG
- ✅ Update .env.example regularly
- ✅ Test before tagging

### **Client Instance Management**
- ✅ Fork from template (don't branch)
- ✅ Keep .env out of git
- ✅ Track customizations in CUSTOMIZATIONS.md
- ✅ Pull template updates regularly
- ✅ Maintain own README for client

### **Multi-Client Scaling**
- ✅ Shared packages (future)
- ✅ Common CI/CD (GitHub Actions)
- ✅ Centralized logging (Sentry)
- ✅ Unified analytics (Vercel Analytics)

---

## 📋 Checklist: New Client Onboarding

### **Phase 1: Preparation**
- [ ] Client information gathered
- [ ] .env template prepared
- [ ] Domain registered/configured
- [ ] Vercel project created

### **Phase 2: Setup**
- [ ] Clone template
- [ ] Configure .env
- [ ] Customize src/data/
- [ ] Update src/lib/agadirHistoryContent.ts
- [ ] Add client assets (logo, audio, etc.)

### **Phase 3: Testing**
- [ ] npm install → success
- [ ] npm run dev → loads correctly
- [ ] All pages accessible
- [ ] No console errors
- [ ] Multi-language works

### **Phase 4: Deployment**
- [ ] npm run build → success
- [ ] GitHub repo created
- [ ] Vercel project linked
- [ ] Environment variables added
- [ ] vercel --prod → deployed

### **Phase 5: Validation**
- [ ] Domain resolves
- [ ] App accessible
- [ ] Features working
- [ ] No 404 errors
- [ ] Production-ready

---

## 📞 Support Matrix

| Question | Answer | Location |
|----------|--------|----------|
| How to setup new client? | SETUP_NEW_CLIENT.md | Template repo |
| How does it work? | ARCHITECTURE.md | Template repo |
| What variables do I need? | .env.example | Any instance |
| How to customize? | SETUP_NEW_CLIENT.md | Template repo |
| How to deploy? | SETUP_NEW_CLIENT.md | Template repo |
| Where's ANATDC code? | agadirnetguida repo | GitHub |
| How to update template? | Commit to main | Template repo |

---

## 🎯 Summary

```
AGRILYS Platform = 1 Template + N Client Instances

agrilys-saas-template/
  └─ [Used to create]
      ├─ agadirnetguida/ (Client #1: ANATDC)
      ├─ client-2/ (Client #2: Coming)
      ├─ client-3/ (Client #3: Coming)
      └─ ...

Each client:
  ✅ Identical code structure
  ✅ Unique .env configuration
  ✅ Unique data (src/data/)
  ✅ Unique domain + Vercel deployment
  ✅ Completely isolated (different repos)
```

---

**AGRILYS SaaS Platform v1.0.0**  
*Template-based, client-isolated, scalable*

---

**Document:** AGRILYS_CLIENTS_MAP.md  
**Created:** 2026-06-29  
**Status:** Reference Documentation
