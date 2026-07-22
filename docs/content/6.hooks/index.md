---
title: Hooks
description: Nuxt hooks used by Nuxt Umbu for module integration
navigation:
  icon: i-lucide-hook
---

Nuxt Umbu uses Nuxt hooks to integrate seamlessly with the Nuxt ecosystem, providing automatic type generation, configuration, and runtime setup.

## Available Hooks

- **[prepare:types](./1.prepare-types.md)** - Configures TypeScript types and module references

## Overview

Hooks in Nuxt Umbu are used to extend Nuxt's build process and runtime behavior. The module leverages Nuxt's hook system to automatically generate TypeScript types, configure aliases, and ensure proper integration with your IDE.

### Quick Start

Nuxt Umbu hooks are automatically registered when you enable the module. No manual configuration is required - the hooks work behind the scenes to provide:

- Automatic TypeScript type generation
- IDE autocomplete support
- Module alias configuration
- Type-safe imports

## How It Works

### Module Initialization

When the Nuxt Umbu module is loaded, it:

1. Registers the `prepare:types` hook
2. Generates type definitions for the auth instance
3. Configures TypeScript compiler options
4. Sets up module aliases for imports

### Type Generation Process

The `prepare:types` hook:

1. Generates `umbu.d.ts` with auth instance types
2. Adds the generated file to TypeScript references
3. Configures path aliases (`#auth-utils`, `#auth-types`)
4. Ensures IDE autocomplete works correctly

## Benefits

Using hooks provides several advantages:

- **Zero configuration**: Types are generated automatically
- **IDE support**: Full autocomplete and type checking
- **Type safety**: Catch errors at compile time
- **Developer experience**: Seamless integration with Nuxt

## Notes

- Hooks are registered automatically by the module
- No manual hook configuration is required
- Hooks run during the Nuxt build process
- Generated types are available in `.nuxt/types/umbu.d.ts`
