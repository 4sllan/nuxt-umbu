---
title: Composables
description: Available composables for authentication in Nuxt Umbu
navigation:
  icon: i-lucide-code-2
---

Nuxt Umbu provides several composables to help you work with authentication in your Nuxt application.

## Available Composables

- **[$autx](./1.autx.md)** - Universal API client for authenticated requests
- **[useAuthConfig](./2.use-auth-config.md)** - Access authentication configuration
- **[useAuthStore](./3.use-auth-store.md)** - Access authentication state
- **[useEnsureCsrf](./4.use-ensure-csrf.md)** - Ensure CSRF token is available for Sanctum requests

## Overview

These composables provide a simple and type-safe way to interact with the authentication layer in your Nuxt application. They are designed to work seamlessly with both Sanctum and Passport providers.

### Quick Start

```typescript
// Access auth configuration
const authConfig = useAuthConfig();

// Access auth state
const authStore = useAuthStore();

// Make authenticated requests
const data = await $autx('/api/users');

// Ensure CSRF token (Sanctum only)
await useEnsureCsrf();
```

## Usage Patterns

### In Components

```vue
<script setup>
const authStore = useAuthStore();
const authConfig = useAuthConfig();

if (authStore.loggedIn) {
  // User is authenticated
}
</script>
```

### In Composables

```typescript
export const useMyFeature = () => {
  const authStore = useAuthStore();
  
  const fetchData = async () => {
    return await $autx('/api/data');
  };
  
  return { fetchData };
};
```

### In Middleware

```typescript
export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore();
  
  if (!authStore.loggedIn) {
    return navigateTo('/login');
  }
});
```
