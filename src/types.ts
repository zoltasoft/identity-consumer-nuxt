export type ZoltaIdentityUser = {
  id: string
  email: string
  name: string
  username: string
  emailVerified: boolean
  isTemporary?: boolean
  expiresAt?: string | null
}

export type ZoltaIdentityApplication = {
  /** Base URL of the Zolta Identity Laravel API, without a trailing slash. */
  identityApiUrl: string
  /** Base URL of the Zolta Identity Nuxt hosted-auth application. */
  hostedAuthUrl: string
  /** Confidential client ID created in the Identity project. */
  clientId: string
  /** Confidential client secret. Server-only: never place this in public runtime config. */
  clientSecret: string
  /** Hosted application key configured in the Identity console. */
  hostedApplication: string
  /** Exact callback URL registered for the confidential client. */
  callbackUrl: string
  /** Cookie name for the app's encrypted server session. */
  sessionCookie?: string
  /** Local path used after authentication when no safe return path is supplied. */
  defaultRedirect?: string
}

export type ZoltaIdentityRuntimeConfig = {
  /** 32+ character secret used only to encrypt consumer sessions. */
  sessionSecret: string
  applications: Record<string, Partial<ZoltaIdentityApplication>>
}
