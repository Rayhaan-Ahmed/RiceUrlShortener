# Frontend Summary

## Overview

This frontend is the **management web application** for the URL shortener project.  
It is responsible for the **management plane** of the system, including creating, browsing, and inspecting shortened links.

The frontend is **not part of the redirect hot path**.  
Redirect requests should bypass the React frontend and go directly to backend services for low-latency handling.

At the current stage, the frontend focuses on:
- establishing the project structure
- building the main management UI pages
- preparing a clear codebase for future backend integration and demo usage

---

## Tech Stack

- **React**
- **TypeScript**
- **Vite**
- **React Router**
- **TanStack Query** (provider initialized for future API integration)
- **Axios** (installed for future API calls)

---

## Current Frontend Scope

The frontend currently represents the **management console** side of the URL shortener system.

Main responsibilities include:
- landing / entry experience
- dashboard UI
- link creation form
- link list management view
- link detail view
- shared layout and routing structure

The frontend currently uses **mock / placeholder data** for UI development and does **not yet call backend APIs**.

---

## Project Structure

```text
Front-End/
  public/
  src/
    app/
      layout/
        AppLayout.tsx
      providers/
        QueryProvider.tsx
      router/
        index.tsx
    pages/
      LandingPage/
        index.tsx
      DashboardPage/
        index.tsx
      CreateLinkPage/
        index.tsx
      LinksPage/
        index.tsx
      LinkDetailPage/
        index.tsx
      SettingsPage/
        index.tsx
    index.css
    main.tsx
  index.html
  package.json
  vite.config.ts
  tsconfig.json
  tsconfig.app.json
  tsconfig.node.json
