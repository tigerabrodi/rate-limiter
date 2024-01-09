import express from 'express'

import { slidingWindowRateLimitMiddleware } from './rateLimitMiddleware'

export const SlidingWindowLogApp = express()
const port = 6080

SlidingWindowLogApp.get('/unlimited', (req, res) => {
  res.send("Unlimited! Let's Go!")
})

SlidingWindowLogApp.get(
  '/limited',
  slidingWindowRateLimitMiddleware,
  (req, res) => {
    res.send("Limited, don't overuse me!")
  }
)

// Start the server
SlidingWindowLogApp.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}/`)
})
