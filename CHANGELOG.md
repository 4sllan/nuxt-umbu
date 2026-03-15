# Changelog

All notable changes to this project will be documented in this file.

---

## v0.0.2

## 🚀 Overview
This release focuses on stabilizing the CI/CD pipeline and automating the NPM library publishing process.

## 📦 What's Changed

### 🤖 CI/CD & Automation
- **NPM Publication:** Automated the release process for the NPM library through GitHub Actions to ensure consistent and reliable deployments.
- **Node.js Setup:** Updated `actions/setup-node` action to **v6** for improved build performance and security.

### 🛠️ Maintenance (Chore)
- Infrastructure dependency updates managed by `@renovate[bot]`.
- General branch synchronization and development workflow improvements.

---

## 📝 Pull Request Details
* **chore(deps):** update actions/setup-node action to v6 ([#46](https://github.com/4sllan/nuxt-umbu/pull/46), [#47](https://github.com/4sllan/nuxt-umbu/pull/47))
* **ci(publish):** automate npm library release through GitHub Actions ([#50](https://github.com/4sllan/nuxt-umbu/pull/50), [#53](https://github.com/4sllan/nuxt-umbu/pull/53), [#55](https://github.com/4sllan/nuxt-umbu/pull/55), [#57](https://github.com/4sllan/nuxt-umbu/pull/57))
* **Develop/Release:** Version synchronization ([#48](https://github.com/4sllan/nuxt-umbu/pull/48), [#49](https://github.com/4sllan/nuxt-umbu/pull/49), [#51](https://github.com/4sllan/nuxt-umbu/pull/51), [#52](https://github.com/4sllan/nuxt-umbu/pull/52), [#54](https://github.com/4sllan/nuxt-umbu/pull/54), [#56](https://github.com/4sllan/nuxt-umbu/pull/56), [#58](https://github.com/4sllan/nuxt-umbu/pull/58))

**Full Changelog**: [v1.0.0...v1.0.1](https://github.com/4sllan/nuxt-umbu/compare/v1.0.0...v1.0.1)

---

## v0.0.1

> ⚠️ **History Reset / First Stable Release**
>
> This version marks the first stable release of the project.
> Previous tags were related to CI/CD setup, workflow experimentation,
> and internal release iterations. Historical changes have been consolidated
> into this 1.0.0 release.

### 🚀 Features
- feat: add LICENSE (#34)
- Initial project development and structural improvements (#1, #3, #8, #16, #20, #23, #26, #28, #36, #39, #41)

### 🛠 Improvements
- chore(ci): configure ESLint 9+ with Nuxt 4 + TypeScript (#12, #13, #14, #15)
- chore(actions): update release workflow to prevent auto version bump (#32)
- chore(actions): improve release workflow with version-specific changelog extraction (#38)

### 🐛 Fixes
- fix: improve test.yml configuration (#4, #6, #10)
- fix: install pnpm in release workflow (#30)

### 📦 Dependencies
- chore(deps): update actions/checkout to v6 (#18)
- chore(deps): update actions/setup-node to v6 (#22, #25, #27)

### 🔄 Internal Maintenance
- Multiple release workflow refinements and internal release iterations (#2, #5, #7, #9, #11, #17, #21, #24, #29, #31, #33, #35, #37, #40, #42)

---

### 👥 New Contributors
- @4sllan made their first contribution in #1
- @renovate[bot] made their first contribution in #18

---

**Full Changelog:**  
https://github.com/4sllan/nuxt-umbu/commits/v1.0.0