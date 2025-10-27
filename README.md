# 💬 Whisp
Projet de messagerie en temps réel – Développement Web Fullstack

## 🌐 Lien du projet en ligne
🔗 [https://whisp-reset.onrender.com/](https://whisp-reset.onrender.com/)

---

## 🧩 Description du projet

**Whisp** est une application de messagerie en temps réel développée dans le cadre de notre cours de **développement web fullstack**.  
Elle permet aux utilisateurs de s’inscrire, se connecter, discuter entre eux, et recevoir des notifications instantanément.

L’objectif principal était de créer une application complète avec **authentification, base de données, messagerie temps réel et interface responsive**.

---

## 🚀 Fonctionnalités principales

- 🔐 **Authentification sécurisée** via **Clerk** (inscription, connexion, déconnexion)
- 💬 **Messagerie en temps réel** avec **Socket.io**
- 👥 **Gestion des contacts et conversations**
    - Création de conversation
    - Ajout ou suppression de contacts
    - Envoi de messages
    - Recherche de contacts
    - Historique des messages
    - Rôles dans la conversation (**admin**, **membre**)
    - L’admin peut renommer ou supprimer la conversation
- 🔔 **Notifications en temps réel**
- 📱 **Interface responsive**

---

## 🛠️ Technologies utilisées

### **Frontend (Next.js)**
- **Next.js** 15
- **React** 19
- **Clerk** (authentification)
- **Socket.io** (temps réel)
- **Tailwind CSS** 
- **Lucide React** 

### **Backend (NestJS)**
- **NestJS** 11
- **Prisma** (accès base de données)
- **PostgreSQL** (base de données sur Render)
- **Socket.io** (communication temps réel)

---

## ⚙️ Installation et lancement local

### 🔧 Prérequis
- Node.js (v18+ recommandé)
- PostgreSQL
- Un compte **Clerk** (pour les clés d’API)

### 1️⃣ Cloner le projet
```bash
git clone https://github.com/ton-compte/whisp.git
cd whisp
```

### 2️⃣ Installer les dépendances

####  Frontend
```bash
cd messagerie-frontend
npm install
```
####  Backend  
```bash
cd messagerie-backend
npm install
```
### 3️⃣ Configurer les variables d’environnement
Créer un fichier .env dans chaque dossier :

#### - Backend (.env)
- DATABASE_URL="ta_database"
- CLERK_SECRET_KEY="ta_clé_clerk"
- CLERK_ISSUER="ton_issuer_clerk"

#### - Frontend (.env.local)
- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="ta_clé_clerk"
- NEXT_PUBLIC_API_URL="http://localhost:3000" (local)
- NEXT_PUBLIC_SOCKET_URL="http://localhost:4000" (local)
- CLERK_SECRET_KEY="ta_clé_clerk"

### 4️⃣ Lancer le projet
#### - Backend (.env)
```bash
npm run start:dev
```

#### - Frontend (.env.local)
```bash
npm run dev
```

## 🧪 Tests
Les tests unitaires et d’intégration sont réalisés avec Jest sur le frontend et le backend.
Des vérifications automatiques sont exécutées à chaque push via GitHub Actions (CI/CD).

## 👩‍💻 Auteur
Projet réalisé par :
- Esther Stassin
- Laetitia Voué
