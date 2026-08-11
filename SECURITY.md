# Security policy

## Supported versions

Only the latest published beta receives security fixes.

## Reporting a vulnerability

Do not open a public issue for suspected vulnerabilities. Report them privately to the maintainers through the security advisory feature of the GitHub repository. Include the affected version, a minimal reproduction, and the potential impact.

The maintainers will acknowledge reports within five business days and coordinate a fix and disclosure timeline with the reporter.

## Consumer responsibilities

- Keep `clientSecret` and `sessionSecret` in private Nuxt runtime configuration or a secret manager.
- Never use `NUXT_PUBLIC_*` for confidential-client credentials.
- Use HTTPS for the Identity API, hosted-auth URL, and callback URL in production.
- Upgrade promptly when a security release is published.
