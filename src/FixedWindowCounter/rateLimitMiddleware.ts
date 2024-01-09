import type express from 'express'

import {
  counters,
  rateLimitWindowInSeconds,
  requestLimitPerWindow,
} from './data'

// Rate limiting middleware
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

  const currentTime = Date.now()
  const windowStart =
    currentTime - (currentTime % (rateLimitWindowInSeconds * 1000))

  if (!counters.has(ip)) {
    counters.set(ip, { count: 1, startTime: windowStart })
    next()
    return
  }

  const windowCounter = counters.get(ip)

  if (windowCounter) {
    if (windowCounter.startTime < windowStart) {
      // Reset the counter for the new window
      windowCounter.count = 1
      windowCounter.startTime = windowStart
      next()
    } else if (windowCounter.count < requestLimitPerWindow) {
      // Increment the counter and allow the request
      windowCounter.count++
      next()
    } else {
      // Rate limit exceeded
      res.status(429).send('Too Many Requests')
    }
  }
}
