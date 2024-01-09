import type express from 'express'

import { requestLogs, requestThreshold, slidingWindowInMs } from './data'

export const rateLimitMiddleware = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const ip = req.ip
  if (!ip) {
    res.status(500).send('No IP address found on request')
    return
  }

  if (!requestLogs.has(ip)) {
    requestLogs.set(ip, { counter: 1, lastRequestTimestamp: Date.now() })
    next()
    return
  }

  const currentTime = Date.now()
  const log = requestLogs.get(ip)

  if (log) {
    const timeElapsed = currentTime - log.lastRequestTimestamp
    const shouldResetCounter = timeElapsed > slidingWindowInMs

    if (shouldResetCounter) {
      log.counter = 1
    } else {
      // Calculate the decrement amount based on the time elapsed
      // Example: Sliding window is 60 seconds, in milliseconds that is 60000
      // reqThreshold is 10
      // This equals to 60000 / 10 = 6000
      // Let's say timeElapsed is 30000, that means 30 seconds have passed
      // 30000 / 6000 = 5
      // So we decrement the counter by 5
      // This effectively calculates the number of requests that are outside of the sliding window
      // Those requests are no longer counted towards the rate limit (expired)
      const decrementAmount = Math.floor(
        timeElapsed / (slidingWindowInMs / requestThreshold)
      )

      // `Math.max` is used to ensure the counter never goes below 0
      log.counter = Math.max(0, log.counter - decrementAmount)
    }

    log.lastRequestTimestamp = currentTime

    const shouldBlockRequest = log.counter >= requestThreshold
    if (shouldBlockRequest) {
      res.status(429).send('Too many requests')
      return
    }

    log.counter++
    next()
  }
}
