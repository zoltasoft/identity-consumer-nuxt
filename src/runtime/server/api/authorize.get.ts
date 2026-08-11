import { createError, defineEventHandler, getQuery, getRouterParam, sendRedirect, setResponseHeader } from 'h3'
import { beginIdentityAuthorization } from '../identity.js'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'cache-control', 'no-store')
  const application = getRouterParam(event, 'application')
  if (!application) throw createError({ statusCode: 400, statusMessage: 'An Identity application is required.' })
  const query = getQuery(event)
  const destination = await beginIdentityAuthorization(event, application, {
    returnTo: typeof query.returnTo === 'string' ? query.returnTo : undefined,
    intent: typeof query.intent === 'string' && ['login', 'register', 'forgot-password', 'reset-password'].includes(query.intent)
      ? query.intent as 'login' | 'register' | 'forgot-password' | 'reset-password'
      : 'login',
    email: typeof query.email === 'string' ? query.email : undefined,
    token: typeof query.token === 'string' ? query.token : undefined,
  })
  return sendRedirect(event, destination, 302)
})
