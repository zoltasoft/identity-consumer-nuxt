import type { H3Event } from 'h3'

export function useRuntimeConfig(event?: H3Event): Record<string, unknown> {
  return (globalThis as { useRuntimeConfig?: (currentEvent?: H3Event) => Record<string, unknown> }).useRuntimeConfig?.(event) ?? {}
}
