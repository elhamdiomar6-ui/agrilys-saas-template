# 📋 Guide - Configuration d'un Nouveau Client AGRILYS

**Pour:** Administrateurs AGRILYS  
**Durée:** ~15 minutes  
**Difficulté:** Facile

---

## 🎯 Objectif

Ce guide explique comment créer une nouvelle instance client à partir du template AGRILYS.

---

## 📋 Étape 1: Cloner le Template

```bash
# Cloner le template
git clone https://github.com/elhamdiomar6-ui/agrilys-saas-template.git client-name
cd client-name

# Renommer la branche (optionnel)
git checkout -b setup-client-name
```

**Résultat:** Vous avez une copie vierge du template

---

## 🔧 Étape 2: Configurer `.env`

### Créer le fichier `.env`
```bash
cp .env.example .env
```

### Remplir les variables (Obligatoires)

**Organization Information:**
```bash
VITE_ASSOCIATION_SLUG=client-slug          # Ex: agadirnetguida
VITE_ASSOCIATION_NAME=CLIENT NAME          # Ex: ANATDC
VITE_ASSOCIATION_FULL_NAME=Full Legal Name # Ex: Association Agadir N'Tguida...
VITE_ASSOCIATION_LEGAL_STATUS=Legal Status # Ex: Dahir 1.58.376
```

**Contact Information:**
```bash
VITE_OFFICIAL_EMAIL=client@example.com      # Email officiel
VITE_GENERAL_PHONE=+212 XXX XXX XXX        # Téléphone général
VITE_PUBLIC_APP_URL=https://client.com     # Domaine client
```

**Leadership Information:**
```bash
VITE_PRESIDENT_NAME=President Name         # Nom du président
VITE_PRESIDENT_EMAIL=pres@example.com      # Email du président
VITE_PRESIDENT_PHONE=+212 XXX XXX XXX      # Téléphone du président
```

**Storage Configuration:**
```bash
VITE_STORAGE_PREFIX=client-slug            # Pour les clés localStorage
```

### Exemple Complet

```bash
# Organization
VITE_ASSOCIATION_SLUG=my-client
VITE_ASSOCIATION_NAME=MY CLIENT ORGANIZATION
VITE_ASSOCIATION_FULL_NAME=My Client Organization - Full Legal Name
VITE_ASSOCIATION_LEGAL_STATUS=Legal registration number/status

# Contacts
VITE_OFFICIAL_EMAIL=contact@myclient.org
VITE_GENERAL_PHONE=+212 XXX XXX XXX
VITE_PUBLIC_APP_URL=https://myclient.agrilys.app

# Leadership
VITE_PRESIDENT_NAME=John Doe
VITE_PRESIDENT_EMAIL=john@myclient.org
VITE_PRESIDENT_PHONE=+212 XXX XXX XXX

# Storage
VITE_STORAGE_PREFIX=my-client
```

---

## 📦 Étape 3: Installer les Dépendances

```bash
npm install
```

Cela va installer tous les packages npm requises.

---

## ✅ Étape 4: Tester Localement

```bash
npm run dev
```

Ouvrir `http://localhost:5173` et vérifier:
- ✅ Page d'accueil chargée
- ✅ Pas d'erreurs console
- ✅ Langue FR/AR fonctionne
- ✅ Données du client visible

---

## 🌐 Étape 5: Préparer pour Production

### 5a. Créer un Repository GitHub pour le Client

```bash
# Sur GitHub, créer un nouveau repo: client-name

# Ajouter le remote
git remote add origin https://github.com/elhamdiomar6-ui/client-name.git

# Push initial
git branch -M main
git push -u origin main
```

### 5b. Configurer les Variables sur Vercel

```bash
# Créer un projet Vercel et linker le repo
vercel link

# Ajouter les variables d'environnement
vercel env add VITE_ASSOCIATION_SLUG
vercel env add VITE_ASSOCIATION_NAME
vercel env add VITE_OFFICIAL_EMAIL
# ... etc (ajouter toutes les variables)
```

### 5c. Déployer en Production

```bash
# Build de production
npm run build

# Déployer sur Vercel
vercel --prod
```

---

## 🔑 Variables d'Environnement - Récapitulatif

### Obligatoires
- `VITE_ASSOCIATION_SLUG` - Identifiant unique du client
- `VITE_ASSOCIATION_NAME` - Nom court
- `VITE_OFFICIAL_EMAIL` - Email de contact
- `VITE_PUBLIC_APP_URL` - URL du client

### Recommandées
- `VITE_ASSOCIATION_FULL_NAME` - Nom légal complet
- `VITE_GENERAL_PHONE` - Téléphone général
- `VITE_PRESIDENT_NAME` - Chef d'organisation
- `VITE_STORAGE_PREFIX` - Clé localStorage

### Optionnelles
- `VITE_ASSOCIATION_LEGAL_STATUS` - Statut juridique
- `VITE_PRESIDENT_EMAIL` - Email du chef
- `VITE_PRESIDENT_PHONE` - Téléphone du chef

---

## 📚 Fichiers Importants à Personnaliser

| Fichier | Action |
|---------|--------|
| `.env` | ✅ **MODIFIER** - Ajouter config du client |
| `src/config/site.ts` | ℹ️ Lire - Référence pour variables |
| `README.md` | ✏️ Mettre à jour si nécessaire |
| `src/pages/public/HomePage.tsx` | Personnaliser le contenu si souhaité |

---

## 🧪 Checklist Avant Production

- [ ] `.env` rempli avec toutes les variables
- [ ] `npm run dev` fonctionne sans erreurs
- [ ] Test local OK (page charge, pas d'erreurs)
- [ ] `npm run build` réussit
- [ ] GitHub repo créé et initial push fait
- [ ] Vercel project linké
- [ ] Variables d'environnement ajoutées dans Vercel
- [ ] DNS personnalisé configuré (optionnel)
- [ ] `vercel --prod` réussi
- [ ] Site accessible en production
- [ ] Pas d'erreurs dans Vercel logs

---

## 🚀 Déploiement Vercel

```bash
# Connexion à Vercel
vercel login

# Lier le projet
vercel link

# Variables d'environnement
vercel env pull      # Télécharger les vars de production
vercel env add ...   # Ajouter manuellement

# Déployer
vercel --prod
```

---

## 🐛 Troubleshooting

### Erreur: "Variable not found"
**Solution:** Vérifier que `.env` existe et contient la variable

### Erreur: "VITE_* undefined"
**Solution:** Vérifier que la variable commence par `VITE_` (frontend only)

### Build échoue
**Solution:** 
```bash
npm install --legacy-peer-deps
npm run build
```

### Vercel deploy échoue
**Solution:** Vérifier les logs avec `vercel logs`

---

## 📞 Support

Pour les questions:
1. Vérifier ce guide
2. Consulter `.env.example`
3. Lire `README.md`
4. Contacter l'administrateur AGRILYS

---

**Template Version:** 1.0.0  
**Last Updated:** 2026-06-29  
**Status:** ✅ Ready for new clients
