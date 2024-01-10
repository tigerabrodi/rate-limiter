import supertest from 'supertest'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { SlidingWindowLogApp } from './app'
import { slidingWindowInMs, requestThreshold } from './data'

describe('Sliding Window Log Rate Limiter Tests', () => {
  beforeEach(() => {
    // Mock time before each test
    vi.useFakeTimers()
  })

  afterEach(() => {
    // Restore real time after each test
    vi.useRealTimers()
  })

  it('/unlimited should allow unlimited requests', async () => {
    for (let i = 0; i < 20; i++) {
      const res = await supertest(SlidingWindowLogApp).get('/unlimited')
      expect(res.statusCode).toBe(200)
    }
  })

  it('/limited should properly rate limit requests', async () => {
    const twoSecondsInMilliseconds = 2000
    const twoSecondsPastWindow = slidingWindowInMs + twoSecondsInMilliseconds

    // Perform requests up to rate limit
    for (let i = 0; i < requestThreshold; i++) {
      const res = await supertest(SlidingWindowLogApp).get('/limited')
      expect(res.statusCode).toBe(200)
    }

    // The next request should be rejected as the rate limit has been reached
    const resExceeded = await supertest(SlidingWindowLogApp).get('/limited')
    expect(resExceeded.statusCode).toBe(429)

    // Advance time to allow some requests to fall outside the sliding window
    // Convert window duration to milliseconds and divide by 2 to allow half the window to pass
    vi.advanceTimersByTime(twoSecondsPastWindow)

    // The next request should be allowed as some requests are now outside the sliding window
    const resAllowed = await supertest(SlidingWindowLogApp).get('/limited')
    expect(resAllowed.statusCode).toBe(200)
  })
})
