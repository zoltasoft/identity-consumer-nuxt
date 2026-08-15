# Zolta Identity Consumer for Nuxt

Server-side hosted-auth consumer for [Zolta Identity](https://github.com/zoltasoft/zolta-identity). It gives a Nuxt application a small BFF surface: it starts hosted login, validates the callback state, exchanges the one-time handoff code with a confidential client, and keeps refresh tokens in an encrypted HTTP-only session cookie.

This is deliberately an authentication integration, not a UI kit. It does not install a dashboard, user menu, login page, global middleware, or domain authorization policy.

> **Beta status:** `0.1.0-beta.1` supports the Zolta Identity API v1 hosted-auth contract. Expect small API changes before `1.0`; pin the beta version in production and read the changelog before upgrading.

## Install

```bash
pnpm add @zoltasoft/identity-consumer-nuxt
```

## Configure one deployed consumer

Create a Zolta Identity **project**, a confidential **client**, and a hosted **application** in the Identity console. The registered client callback URL and the Nuxt configuration below must match exactly.

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@zoltasoft/identity-consumer-nuxt'],

  zoltaIdentityConsumer: {
    routePrefix: '/api/identity', // optional; this is the default
  },

  runtimeConfig: {
    zoltaIdentity: {
      sessionSecret: '',
      applications: {
        documentStudio: {
          identityApiUrl: '',
          hostedAuthUrl: '',
          clientId: '',
          clientSecret: '',
          hostedApplication: 'document-studio',
          callbackUrl: 'https://studio.example.com/api/identity/document-studio/auth/callback',
          sessionCookie: 'zolta-document-studio-session',
          defaultRedirect: '/document-studio',
          sandboxApplication: 'documentStudioSandbox',
        },
        documentStudioSandbox: {
          identityApiUrl: '',
          hostedAuthUrl: '',
          clientId: '',
          clientSecret: '',
          hostedApplication: 'document-studio',
          callbackUrl: 'https://studio.example.com/api/identity/document-studio/auth/callback',
        },
      },
    },
  },
})
```

Declare every application key in `nuxt.config.ts`, then supply all sensitive deployment values through environment variables (or your secret manager). Nuxt resolves the nested key as follows:

```dotenv
NUXT_ZOLTA_IDENTITY_SESSION_SECRET=<unique-32+-character-secret>
NUXT_ZOLTA_IDENTITY_APPLICATIONS_DOCUMENT_STUDIO_IDENTITY_API_URL=https://identity-api.example.com
NUXT_ZOLTA_IDENTITY_APPLICATIONS_DOCUMENT_STUDIO_HOSTED_AUTH_URL=https://identity.example.com
NUXT_ZOLTA_IDENTITY_APPLICATIONS_DOCUMENT_STUDIO_CLIENT_ID=<confidential-client-id>
NUXT_ZOLTA_IDENTITY_APPLICATIONS_DOCUMENT_STUDIO_CLIENT_SECRET=<confidential-client-secret>
NUXT_ZOLTA_IDENTITY_APPLICATIONS_DOCUMENT_STUDIO_HOSTED_APPLICATION=document-studio
NUXT_ZOLTA_IDENTITY_APPLICATIONS_DOCUMENT_STUDIO_CALLBACK_URL=https://studio.example.com/api/identity/document-studio/auth/callback
NUXT_ZOLTA_IDENTITY_APPLICATIONS_DOCUMENT_STUDIO_SESSION_COOKIE=zolta-document-studio-session
NUXT_ZOLTA_IDENTITY_APPLICATIONS_DOCUMENT_STUDIO_DEFAULT_REDIRECT=/document-studio
NUXT_ZOLTA_IDENTITY_APPLICATIONS_DOCUMENT_STUDIO_SANDBOX_APPLICATION=documentStudioSandbox
NUXT_ZOLTA_IDENTITY_APPLICATIONS_DOCUMENT_STUDIO_SANDBOX_IDENTITY_API_URL=https://identity-api.example.com
NUXT_ZOLTA_IDENTITY_APPLICATIONS_DOCUMENT_STUDIO_SANDBOX_HOSTED_AUTH_URL=https://identity.example.com
NUXT_ZOLTA_IDENTITY_APPLICATIONS_DOCUMENT_STUDIO_SANDBOX_CLIENT_ID=<sandbox-confidential-client-id>
NUXT_ZOLTA_IDENTITY_APPLICATIONS_DOCUMENT_STUDIO_SANDBOX_CLIENT_SECRET=<sandbox-confidential-client-secret>
NUXT_ZOLTA_IDENTITY_APPLICATIONS_DOCUMENT_STUDIO_SANDBOX_HOSTED_APPLICATION=document-studio
NUXT_ZOLTA_IDENTITY_APPLICATIONS_DOCUMENT_STUDIO_SANDBOX_CALLBACK_URL=https://studio.example.com/api/identity/document-studio/auth/callback
```

`runtimeConfig.zoltaIdentity` is private by default. Do **not** place it under `runtimeConfig.public`, expose it through `app.config`, or prefix secrets with `NUXT_PUBLIC_`.

Use one confidential client and one consumer session secret per deployed application/environment. For example, production and staging should have separate client secrets. The hosted application record is public presentation/routing metadata; the confidential client is the credential held by the app's server. `IDENTITY_HOSTED_APPLICATIONS_TOKEN` belongs only to the Zolta Identity host and API deployments—consumer Nuxt apps do not need it.

## Optional sandbox demos

To offer the hosted **Create instant demo account** action, create a separate
sandbox project and a dedicated sandbox BFF client in the Identity Console.
Link that client in the hosted application's **Sandbox client ID** field. Add a
second application configuration and set the live configuration's
`sandboxApplication` to its key, as shown above. Both BFF configurations must
use the exact callback URL registered on the hosted application. The module
uses the callback's connection binding to exchange and refresh sandbox tokens
with the sandbox client while preserving one normal consumer session.

## Routes

For an application named `document-studio`, the module registers these no-store BFF endpoints:

| Route | Purpose |
| --- | --- |
| `GET /api/identity/document-studio/auth/authorize` | Stores a state transaction then redirects to hosted auth. |
| `GET /api/identity/document-studio/auth/callback` | Validates state, exchanges the handoff code, and redirects locally. |
| `GET /api/identity/document-studio/auth/session` | Returns only the public user profile or `null`. |
| `POST /api/identity/document-studio/auth/logout` | Revokes remote access when possible and clears the local session. |
| `GET /api/identity/document-studio/account/authorize` | Requires an existing Identity session, creates a short-lived one-time account-portal intent, then redirects to the hosted account authentication page before settings. |
| `GET /api/identity/document-studio/account/logout` | Clears the consumer session and begins a new hosted sign-in flow after account-portal logout. |

Use the account route only for an authenticated user's **Manage identity** action. The opaque intent is issued and consumed by Identity; consumers never sign or validate it, and no access or refresh token is placed in the browser URL.

Start login from a page, component, or server route:

```vue
<script setup lang="ts">
const identity = useZoltaIdentitySession('document-studio')
</script>

<template>
  <NuxtLink :to="identity.authorize('/document-studio')">Sign in</NuxtLink>
</template>
```

Protect selected routes without installing a global guard:

```ts
// app/middleware/require-document-studio-auth.ts
export default createZoltaIdentityRouteMiddleware('document-studio')
```

```ts
definePageMeta({ middleware: ['require-document-studio-auth'] })
```

For a Laravel BFF endpoint, read the token only on the Nuxt server:

```ts
import { identityAccessToken, requireIdentityUser } from '@zoltasoft/identity-consumer-nuxt/runtime'

export default defineEventHandler(async (event) => {
  const user = await requireIdentityUser(event, 'document-studio')
  const token = await identityAccessToken(event, 'document-studio')
  // Call the application service with `Authorization: Bearer ${token}`.
  return { user }
})
```

If your host app protects POST requests with CSRF middleware, pass that header into `identity.logout({ headers })`; this package does not silently weaken the host's CSRF policy.

## Security model

- The client secret, handoff code exchange, refresh token, and access token remain on the Nuxt server.
- Authentication state is random, bound to an HTTP-only transaction cookie, expires after ten minutes, and is cleared after one callback attempt.
- Sessions are encrypted with `zoltaIdentity.sessionSecret`, use `HttpOnly`, `SameSite=Lax`, and `Secure` in production.
- Redirect targets are restricted to local paths. Protocol-relative and backslash-based values are rejected.
- Production rejects non-local HTTP identity and callback URLs.
- Account-management redirects use an Identity-issued, short-lived, single-use portal intent. A direct account URL is rejected by the hosted portal when its entry authorization is absent.

The module supports the Zolta Identity API v1 handoff, refresh, and logout contract. Treat that API version as the compatibility boundary; a breaking protocol change will be released as a new major module version.

See [SECURITY.md](./SECURITY.md) for responsible disclosure and deployment responsibilities.

## Contract fixture

`fixtures/contract-app` is a minimal Nuxt host app. It is used by the real-contract workflow against a disposable Zolta Identity v1 deployment. Configure the repository's `ZOLTA_IDENTITY_CONTRACT_*` secrets before enabling the workflow. The normal pull-request suite is hermetic and never needs real credentials.

## Release

The publish workflow uses npm trusted publishing. Before the first release, create the public npm package and configure its trusted publisher for this GitHub repository. Tag a release as `vX.Y.Z`; the workflow builds, tests, and publishes with provenance.
