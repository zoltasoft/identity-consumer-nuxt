import { createError, defineEventHandler, getQuery, getRouterParam, sendRedirect, setResponseHeader } from 'h3'
import { z } from 'zod'
import { completeIdentityAuthorization } from '../identity.js'

const callbackSchema = z.object({
  code: z.string().min(32).max(1024),
  state: z.string().min(32).max(256),
})

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'cache-control', 'no-store')
  const application = getRouterParam(event, 'application')
  if (!application) throw createError({ statusCode: 400, statusMessage: 'An Identity application is required.' })
  const query = callbackSchema.safeParse(getQuery(event))
  if (!query.success) throw createError({ statusCode: 400, statusMessage: 'The Identity callback is incomplete.' })
  const destination = await completeIdentityAuthorization(event, application, query.data.code, query.data.state)
  return sendRedirect(event, destination, 302)
})
