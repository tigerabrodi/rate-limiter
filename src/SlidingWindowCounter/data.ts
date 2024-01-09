export type RequestLog = {
  counter: number
  lastRequestTimestamp: number
}

export const requestThreshold = 10
export const slidingWindowInMs = 60 * 1000 // 60 seconds
export const requestLogs = new Map<string, RequestLog>() // Map to store logs per IP
