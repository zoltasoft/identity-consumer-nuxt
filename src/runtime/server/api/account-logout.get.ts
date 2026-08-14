import { createError, defineEventHandler, getRouterParam, getRequestURL, sendRedirect, setResponseHeader } from 'h3'
import { logoutIdentityApplication } from '../identity.js'

/** Clears the host BFF session, then starts the normal hosted sign-in flow. */
export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'cache-control', 'no-store')
  const application = getRouterParam(event, 'application')
  if (!application) throw createError({ statusCode: 400, statusMessage: 'An Identity application is required.' })
  await logoutIdentityApplication(event, application)
  const current = getRequestURL(event)
  const destination = `${current.pathname.replace(/\/account\/logout$/, '/auth/authorize')}`
  return sendRedirect(event, destination, 302)
})
