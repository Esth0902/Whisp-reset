This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# Whisp - Application de Messagerie en Temps Réel

Une application de messagerie moderne et complète avec authentification, conversations en temps réel, système d'amis et notifications.

## 🏗️ Architecture

Le projet est composé de deux parties principales :

- **Backend** : API NestJS avec WebSocket pour la communication temps réel
- **Frontend** : Application Next.js avec React 19

## 🚀 Stack Technique

### Backend (`messagerie-backend`)
- **Framework** : NestJS 11
- **Base de données** : Prisma ORM
- **Temps réel** : Socket.IO 4.8
- **Authentification** : Clerk
- **Langage** : TypeScript
- **Tests** : Jest

### Frontend (`messagerie-frontend`)
- **Framework** : Next.js 15.5
- **UI** : React 19, TailwindCSS
- **State Management** : Zustand
- **Authentification** : Clerk
- **Notifications** : React Hot Toast
- **Icons** : Lucide React
- **Temps réel** : Socket.IO Client

## 📋 Prérequis

- Node.js (version 18+)
- npm
- PostgreSQL (ou autre base de données compatible Prisma)
- Compte Clerk pour l'authentification

## 🔧 Installation

## 🌟 Fonctionnalités

- ✅ Authentification sécurisée (Clerk)
- ✅ Messagerie en temps réel (WebSocket)
- ✅ Système d'amis et invitations
- ✅ Notifications en temps réel
- ✅ Gestion de profil utilisateur
- ✅ Interface responsive et moderne

## 🔒 Variables d'Environnement
Consultez les fichiers .env.example (à créer) dans chaque dossier pour la liste complète des variables nécessaires.

## 📄 Licence
UNLICENSED - Projet privé

## 👥 Auteurs
Stassin Esther
Voué Laetitia 