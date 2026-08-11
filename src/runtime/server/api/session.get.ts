import { createError, defineEventHandler, getRouterParam, setResponseHeader } from 'h3'
import { identityBrowserSession } from '../identity.js'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'cache-control', 'no-store')
  const application = getRouterParam(event, 'application')
  if (!application) throw createError({ statusCode: 400, statusMessage: 'An Identity application is required.' })
  return { user: await identityBrowserSession(event, application) }
})
