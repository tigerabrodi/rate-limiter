import express from 'express'

export const FixedWindowCounterApp = express()
const port = 7080

FixedWindowCounterApp.get('/unlimited', (req, res) => {
  res.send("Unlimited! Let's Go!")
})

FixedWindowCounterApp.get('/limited', (req, res) => {
  res.send("Limited, don't overuse me!")
})

// Start the server
FixedWindowCounterApp.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}/`)
})
