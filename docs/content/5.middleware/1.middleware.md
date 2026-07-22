---
title: Middleware
description: Route middleware for protecting application routes in Nuxt Umbu
navigation:
  icon: i-lucide-shield-check
---

Nuxt Umbu provides route middleware to protect your application routes, ensuring only authenticated users can access specific areas of your application. Note that API and server endpoints require separate server-side authentication checks on your backend.

## Available Middleware

- **[auth](./1.auth.md)** - Route middleware to protect authenticated routes
- **[two-factor](./2.two-factor.md)** - Route middleware to protect 2FA-enabled routes

## Overview

Middleware in Nuxt Umbu provides automatic authentication validation for application routes in both client-side and server-side rendering contexts. They handle session validation, token expiration, strategy consistency, and automatic logout when authentication fails. For securing API endpoints or server-side routes, implement authentication checks directly on your backend server.

### Quick Start

```typescript
// In your page or route
definePageMeta({
  middleware: ['umbu:auth'] // or ['umbu:two-factor']
})
```

## Provider-Specific Middleware

### Sanctum Middleware

Sanctum middleware uses cookie-based authentication and CSRF tokens:

- **umbu:auth**: Validates Laravel session and XSRF token
- **umbu:two-factor**: Validates 2FA cookie token

### Passport Middleware

Passport middleware uses token-based authentication:

- **umbu:auth**: Validates access token and expiration
- **umbu:two-factor**: Validates 2FA access token

## Usage Patterns

### Protecting a Single Route

```typescript
// pages/dashboard.vue
definePageMeta({
  middleware: ['umbu:auth']
})
```

### Protecting Multiple Routes

```typescript
// middleware/auth.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()
  
  if (!authStore.loggedIn) {
    return navigateTo('/login')
  }
})
```

### Conditional Middleware

```typescript
definePageMeta({
  middleware: 'umbu:auth'
})
```

For conditional middleware logic, implement the branching within a custom middleware function or check conditions in your page component before applying protection.

## How It Works

### Client-Side Validation

On the client, middleware:

1. Extracts authentication data from storage (cookies/localStorage)
2. Validates session/token expiration
3. Checks strategy consistency
4. Validates user auth state
5. Automatically logs out and redirects if validation fails

### Server-Side Validation

On the server, middleware:

1. Extracts authentication data from request headers/cookies
2. Validates session/token expiration
3. Sets necessary headers (XSRF for Sanctum)
4. Automatically logs out and redirects if validation fails

## Automatic Logout

All middleware automatically handle logout scenarios:

- **Token expiration**: User is logged out and redirected to login
- **Invalid session**: User is logged out and redirected to login
- **Strategy mismatch**: User is logged out and redirected to login
- **Missing credentials**: User is logged out and redirected to login

The redirect path is configurable via the auth configuration.

## Notes

- Middleware is automatically registered by the module with the `umbu:` prefix
- No manual import required - just use `umbu:auth` or `umbu:two-factor`
- Both Sanctum and Passport providers have their own implementations
- The same middleware names work for both providers
