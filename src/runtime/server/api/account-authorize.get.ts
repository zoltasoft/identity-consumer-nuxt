import { createError, defineEventHandler, getQuery, getRouterParam, sendRedirect, setResponseHeader } from 'h3'
import { beginIdentityAccountPortal } from '../identity.js'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'cache-control', 'no-store')
  const application = getRouterParam(event, 'application')
  if (!application) throw createError({ statusCode: 400, statusMessage: 'An Identity application is required.' })
  const tab = getQuery(event).tab === 'security' ? 'security' : 'profile'
  return sendRedirect(event, await beginIdentityAccountPortal(event, application, tab), 302)
})
