type WindowCounter = {
  count: number
  startTime: number
}

export const rateLimitWindowInMs = 60 * 1000
export const requestLimitPerWindow = 10
export const counters = new Map<string, WindowCounter>()
