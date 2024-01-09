type WindowCounter = {
  count: number
  startTime: number
}

export const rateLimitWindowInSeconds = 60
export const requestLimitPerWindow = 10
export const counters = new Map<string, WindowCounter>()
