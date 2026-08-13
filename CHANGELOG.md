# Changelog

All notable changes to this project are documented in this file.

## 0.1.0-beta.2 - 2026-08-13

- Add sandbox BFF-client support for hosted instant-demo-account handoffs.
- Preserve the selected token connection for token exchange, refresh, and logout.
- Document sandbox configuration and provide environment-variable examples.

## 0.1.0-beta.1 - 2026-08-11

- First npm beta release.
- Add a TypeScript-aware ESLint 9 release gate.
- Add configuration and token-handling regression coverage.
- Document the supported security-reporting and consumer-secret handling process.

## 0.1.1 - 2026-08-10

- Fix published-runtime imports so Nuxt and Nitro APIs resolve when the module is installed from npm.

## 0.1.2 - 2026-08-10

- Keep client helpers out of the server runtime entry point so Nitro does not load Vue app imports.

## 0.1.0 - 2026-08-10

- Initial public Nuxt module for the Zolta Identity API v1 hosted-auth handoff flow.
- Server-only confidential-client exchange and refresh support.
- Named encrypted sessions, opt-in browser helpers, and opt-in route middleware.
