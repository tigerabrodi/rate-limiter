import express from 'express'

import { rateLimitMiddleware } from './rateLimitMiddleware'

export const SlidingWindowCounterApp = express()
const port = 6080

SlidingWindowCounterApp.get('/unlimited', (req, res) => {
  res.send("Unlimited! Let's Go!")
})

SlidingWindowCounterApp.get('/limited', rateLimitMiddleware, (req, res) => {
  res.send("Limited, don't overuse me!")
})

// Start the server
SlidingWindowCounterApp.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}/`)
})
