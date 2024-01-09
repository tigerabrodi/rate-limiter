import express from 'express'

export const SlidingWindowLogApp = express()
const port = 6080

SlidingWindowLogApp.get('/unlimited', (req, res) => {
  res.send("Unlimited! Let's Go!")
})

SlidingWindowLogApp.get('/limited', (req, res) => {
  res.send("Limited, don't overuse me!")
})

// Start the server
SlidingWindowLogApp.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}/`)
})
