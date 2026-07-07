# YojanaTrack Architecture & Advanced Web Concepts

Welcome to the comprehensive architecture and technical documentation for **YojanaTrack**—an industry-grade, fullstack welfare scheme discovery platform. 

This document outlines the complete tech stack, directory structure, and the advanced architectural design patterns implemented to make this application highly secure, performant, and production-ready.

---

## 🛠️ The Tech Stack

YojanaTrack is built on a modern, decoupled **MERN (MongoDB, Express, React, Node.js)** stack optimized for absolute type safety and responsiveness.

### 1. Frontend Architecture
*   **React 19 + Vite**: Leverages Vite's extremely fast ESBuild-based HMR (Hot Module Replacement) and optimized production Rollup builds.
*   **TypeScript**: Complete compile-time type checking for application state, UI components, and API contracts.
*   **Tailwind CSS (v3) + PostCSS**: Utility-first CSS styling designed to build highly customizable, glassmorphic interfaces without bloat.
*   **Lucide React**: Vector-based, lightweight dynamic icons.
*   **Zustand**: A lightweight, modern client-side state management system to store auth state without React Context re-render performance hits.
*   **TanStack Query (React Query)**: Handles all server state management, background caching, queries deduplication, loading states, and automatic cache invalidation.
*   **React Hook Form + Zod**: Declarative form validation that guarantees strict type validation before data reaches backend endpoints.

### 2. Backend Infrastructure
*   **Node.js & Express.js**: Fully modular REST API written entirely in TypeScript using `ts-node-dev` for high-velocity local development.
*   **Mongoose ODM**: A robust MongoDB object data modeling tool that provides schema validation, business logic hooks, and clean TypeScript interfaces.
*   **MongoDB**: High-availability document-oriented NoSQL database managing user profiles, schemes, bookmarks, and application tracking.
*   **Redis (Planned / Future Work)**: Planned in-memory data store for caching scheme details, sessions, and distributed rate-limiting.
*   **Winston**: Professional-grade transport logging framework with structured JSON/Console output for log tracking.

### 3. Security Framework
*   **Helmet.js**: Dynamically configures secure HTTP response headers to prevent common vulnerabilities (Clickjacking, XSS).
*   **Express Rate Limit**: Implements localized and global rate-limiting to protect the auth and content endpoints from Distributed Denial of Service (DDoS) and brute-force attacks.
*   **CORS (Cross-Origin Resource Sharing)**: Fine-grained access control ensuring resource containment and credentials safety across local development and production origins.

---

## 🚀 Advanced Web Development Concepts Applied

Several enterprise-level patterns were built into this project to scale performance and secure endpoints. Below is a breakdown of these key concepts:

### 1. Silent JWT Token Rotation & Authentication
Rather than storing authentication tokens inside vulnerable LocalStorage or SessionStorage (which are susceptible to Cross-Site Scripting or XSS attacks), YojanaTrack implements a secure **dual-token architecture**:

*   **Short-lived Access Token**: Valid for 15 minutes, passed as a standard JSON payload upon login and stored in the client's volatile memory (Zustand state).
*   **Long-lived Refresh Token**: Valid for 7 days, stored inside a secure, `httpOnly`, `sameSite: 'strict'` cookie. The frontend JavaScript cannot read or modify this cookie, completely mitigating XSS token extraction.
*   **Automatic Silent Rotation**:
    ```mermaid
    sequenceDiagram
        Client->>Server: Request /api/schemes (with Expired Access Token)
        Server-->>Client: 401 Unauthorized (Expired)
        Client->>Server: Request /api/auth/refresh (httpOnly cookie automatically attached)
        Server->>Server: Validate Refresh Token & Database Session
        Server-->>Client: Send New Access Token & Rotate Refresh Cookie
        Client->>Server: Retry original request /api/schemes
        Server-->>Client: 200 OK (Success)
    ```

### 2. Axios Request & Response Interceptors
To make token rotation completely seamless for the user, YojanaTrack configures a robust **Axios Interceptor system** at the API gateway layer:
*   **Request Interceptor**: Automatically intercepts every outgoing API call and attaches the user's volatile `accessToken` as a `Bearer` token inside the `Authorization` header.
*   **Response Interceptor**: Monitors incoming responses. If a `401 Unauthorized` occurs due to an expired access token, it automatically pauses all outstanding requests, fires a POST request to `/api/auth/refresh` to fetch a new token, updates the client store, and retries the failed requests in the background. It also includes recursion-guards to prevent infinite loops when refreshing fails.

### 3. Zod-Based Input Validation & Type Assertion
Using Zod, we implement "Parse, Don't Validate". Instead of simple conditionals, Zod asserts schemas runtime:
*   On the **backend**, schemas are mapped to Express request objects (`body`, `query`, or `params`). Requests that fail schemas are instantly rejected in a unified validation middleware before they ever touch the database, protecting it from malformed queries.
*   On the **frontend**, Zod schemas mirror Zod's backend validation schemas. React Hook Form leverages this to prevent submitting forms unless the local fields conform exactly to what the database expects, ensuring visual consistency and performance.

### 4. Advanced Database Seeding & Data Validation
Utilizing Mongoose schema definitions, we've designed models to map user relationships to government yojanas.
*   The `seedMongo.ts` script uses highly optimized cryptographic hashes (`bcryptjs` with 10 salt-rounds) to initialize administrative and standard user accounts.
*   MongoDB references handles relational mappings—such as bookmarks and application tracking—using document IDs that reference schemes and user accounts.

### 5. Loopback Resolution & CORS Defense
To prevent common local development blockades where modern browsers resolve `localhost` over IPv6 (`::1`) while local Node processes bind to IPv4 (`127.0.0.1`), we:
*   Set the client API endpoint to explicitly target the IPv4 loopback (`127.0.0.1`), eliminating DNS lookup delays and browser socket rejection.
*   Configure CORS to allow dynamic multi-origin arrays, making the application cross-origin resilient whether the user launches on `127.0.0.1` or `localhost` (including both port `5173` and `5174`).
