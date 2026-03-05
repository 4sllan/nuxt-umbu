# Contributing to Nuxt Umbu

Thank you for considering contributing to **Nuxt Umbu**!  
Your help makes this project better for the entire community.

This document explains how to contribute with code, documentation, bug reports and improvements.

---

## 📌 Ways to Contribute

You can contribute in several ways:

- 🐛 Reporting bugs
- 💡 Suggesting new features
- 📖 Improving documentation
- 🧪 Writing tests
- 🔧 Fixing bugs
- 🚀 Improving performance or security

---

## 🐞 Reporting Bugs

Before opening a new issue:

1. Search existing issues to avoid duplicates.
2. Ensure the bug happens in the latest version.
3. Provide as much detail as possible.

When creating a bug report, include:

- Nuxt version
- Nuxt Umbu version
- Laravel version (if applicable)
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots or logs if possible

---

## 💡 Suggesting Features

Feature requests are welcome!

Please include:

- A clear description of the feature
- The problem it solves
- Possible implementation ideas (optional)

---

## 🛠 Development Setup

Clone the repository:

```bash
git clone https://github.com/4sllan/nuxt-umbu.git
cd nuxt-umbu
```
Install dependencies:

```bash
pnpm install
```
Run the development environment:

```bash
pnpm dev
```

## 🌿 Branch Strategy

Please follow this workflow:

1. Fork the repository

2. Create a new branch from main

Example:

```bash
git checkout -b feat/my-feature
```

| Type     | Example                    |
| -------- | -------------------------- |
| Feature  | `feat/add-sanctum-support` |
| Fix      | `fix/token-refresh`        |
| Docs     | `docs/update-auth-flow`    |
| Refactor | `refactor/auth-module`     |

## ✍️ Commit Guidelines

We follow Conventional Commits:
```text
type(scope): description
```

Examples:

```text
feat(auth): add 2FA support
fix(sanctum): resolve csrf token issue
docs: update installation guide
```

Common commit types:

- feat
- fix
- docs
- refactor
- test
- chore

## 📦 Pull Request Guidelines

Before submitting a Pull Request, please ensure the following:

- Your code follows the project coding style
- Documentation is updated when necessary
- The module builds correctly

### PR Checklist

Before opening your PR, confirm that:

- [ ] Code compiles without errors
- [ ] Documentation has been updated (if needed)
- [ ] No unnecessary files were included
- [ ] Pull request contains a clear and descriptive explanation

## 🔐 Security Issues

If you discover a security vulnerability, please do not open a public issue.

Instead, report it privately by contacting the maintainer.

## ❤️ Community

Please be respectful and constructive in discussions.

We aim to build a welcoming environment for all contributors.

## 🙌 Thank You

Thank you for helping improve Nuxt Umbu!