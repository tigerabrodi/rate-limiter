import express from 'express'

import { rateLimitMiddleware } from './rateLimitMiddleware'

export const TokenBucketApp = express()
const port = 8080

TokenBucketApp.get('/unlimited', (req, res) => {
  res.send("Unlimited! Let's Go!")
})

// Rate limiting middleware

TokenBucketApp.get('/limited', rateLimitMiddleware, (req, res) => {
  res.send("Limited, don't overuse me!")
})

// Start the server
TokenBucketApp.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}/`)
})
