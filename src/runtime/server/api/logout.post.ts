import { createError, defineEventHandler, getRouterParam, setResponseHeader } from 'h3'
import { logoutIdentityApplication } from '../identity.js'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'cache-control', 'no-store')
  const application = getRouterParam(event, 'application')
  if (!application) throw createError({ statusCode: 400, statusMessage: 'An Identity application is required.' })
  await logoutIdentityApplication(event, application)
  return { ok: true }
})
