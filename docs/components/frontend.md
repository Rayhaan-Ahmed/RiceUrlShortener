# Frontend Architecture

## 1. Overview

The frontend is the web interface of the Atlas URL Shortener project.

Its responsibilities include:

- providing pages for link creation and management
- presenting link-related information to users
- interacting with backend APIs
- serving as the main user-facing layer of the system

Current frontend stack:

- React
- TypeScript
- Vite
- React Router
- React Query

---

## 2. Goals

The frontend is expected to support the following user workflows:

- create a short link
- view existing links
- inspect link details
- manage links
- access settings or account-related pages

---

## 3. Project Structure

Frontend source root:

```text
Front-End/src
````

High-level structure:

```text
src/
  app/
    layout/
    providers/
    router/
  pages/
    LandingPage/
    DashboardPage/
    CreateLinkPage/
    LinksPage/
    LinkDetailPage/
    SettingsPage/
```

### Main folders

#### `app/`

Application-level infrastructure such as routing, providers, and shared layout.

#### `pages/`

Page-level UI components corresponding to routes.

#### `providers/`

Application providers such as query client setup.

---

## 4. Application Entry

Main entry file:

```text
src/main.tsx
```

Responsibilities of the entry file:

* bootstraps the React application
* mounts the router
* initializes global providers

---

## 5. Global Providers

### Query Provider

File:

```text
src/app/providers/QueryProvider.tsx
```

Purpose:

* provides React Query context to the application
* supports future API data fetching and caching

Other global providers:

*

---

## 6. Routing Structure

Router file:

```text
src/app/router/index.tsx
```

Current route structure:

* `/`

  * `LandingPage`
* `/app`

  * `AppLayout`
  * `/app/dashboard`

    * `DashboardPage`
  * `/app/create`

    * `CreateLinkPage`
  * `/app/links`

    * `LinksPage`
  * `/app/links/:alias`

    * `LinkDetailPage`
  * `/app/settings`

    * `SettingsPage`

### Routing Notes

* React Router is used for page navigation.
* The `/app` route acts as the main application shell.
* Nested routes render inside the shared layout.

---

## 7. Layout Structure

Main layout file:

```text
src/app/layout/AppLayout.tsx
```

Purpose:

* provides the shared application shell
* renders common navigation
* renders page content through nested routing

Layout elements currently visible in code:

* sidebar navigation
* main content area
* outlet for child routes

Other shared layout elements:

*

---

## 8. Pages

### 8.1 Landing Page

File:

```text
src/pages/LandingPage/index.tsx
```

Purpose:

* public-facing entry page of the application

Main responsibilities:

*
*
*

---

### 8.2 Dashboard Page

File:

```text
src/pages/DashboardPage/index.tsx
```

Purpose:

* main dashboard after entering the application

Main responsibilities:

*
*
*

---

### 8.3 Create Link Page

File:

```text
src/pages/CreateLinkPage/index.tsx
```

Purpose:

* page for creating a new short link

Expected responsibilities:

* accept long URL input
* optionally accept custom alias
* submit creation request to backend
* show created short link result

Current implementation notes:

* page scaffold exists
* detailed form behavior is not yet documented here

---

### 8.4 Links Page

File:

```text
src/pages/LinksPage/index.tsx
```

Purpose:

* page for listing user-created links

Expected responsibilities:

* fetch user links
* display paginated results
* navigate to link details

Current implementation notes:

* page scaffold exists
* list rendering and API integration details are not yet documented here

---

### 8.5 Link Detail Page

File:

```text
src/pages/LinkDetailPage/index.tsx
```

Purpose:

* display details for a specific link

Expected responsibilities:

* show link metadata
* display status information
* support future management actions

Current implementation notes:

* page scaffold exists
* detail loading behavior is not yet documented here

---

### 8.6 Settings Page

File:

```text
src/pages/SettingsPage/index.tsx
```

Purpose:

* application settings page

Expected responsibilities:

*
*
*

---

## 9. Frontend–Backend Integration

Expected backend interaction includes:

* create short link
* fetch link details
* list links
* update link
* delete link

Relevant backend API surface from project sources:

* `POST /api/links`
* `GET /api/links/{alias}`
* `GET /api/links`
* `GET /r/{alias}`

Planned frontend API client location:

*

Data-fetching hooks:

*

Mutation hooks:

*

Base URL configuration:

*

Error handling strategy:

*

---

## 10. State Management

Current visible state/data infrastructure:

* React local component state
* React Query provider

Other state management tools:

*

Planned shared state areas:

*
*
*

---

## 11. Authentication

Authentication-related frontend structure:

*

Protected routes:

*

Token handling:

*

User session storage:

*

Integration with Google Auth:

*

---

## 12. Styling and UI Organization

Styling files observed:

* `src/index.css`

UI component organization:

* page-based structure
* shared layout in `app/layout`

Shared component library:

*

Design system / styling conventions:

*

---

## 13. Data Fetching Strategy

React Query is available in the project and appears intended for API integration.

Expected usage areas:

* link list fetching
* link detail fetching
* create/update/delete mutations

Query key design:

*

Caching strategy on the frontend:

*

Optimistic update strategy:

*

---

## 14. Error Handling and UX

Expected categories of frontend errors:

* invalid form input
* failed API request
* not found
* expired link
* unauthorized access

UI handling approach:

*
*
*

Loading states:

*

Empty states:

*

---

## 15. Notes for Future Updates

This document should be updated as the frontend becomes more complete.

Suggested update points:

* add API client structure
* document form components
* document authentication flow
* document shared UI components
* document request/response handling patterns
