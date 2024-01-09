import supertest from 'supertest'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { SlidingWindowCounterApp } from './app'
import { requestThreshold, slidingWindowInMs } from './data'

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
      const res = await supertest(SlidingWindowCounterApp).get('/unlimited')
      expect(res.statusCode).toBe(200)
    }
  })

  it('/limited should properly rate limit requests', async () => {
    // Perform requests up to rate limit
    for (let i = 0; i < requestThreshold; i++) {
      const res = await supertest(SlidingWindowCounterApp).get('/limited')
      expect(res.statusCode).toBe(200)
    }

    // The next request should be rejected as the rate limit has been reached
    const resExceeded = await supertest(SlidingWindowCounterApp).get('/limited')
    expect(resExceeded.statusCode).toBe(429)

    // Advance time to allow some requests to fall outside the sliding window
    vi.advanceTimersByTime(slidingWindowInMs / 2)

    // The next request should be allowed as some requests are now outside the sliding window
    const resAllowed = await supertest(SlidingWindowCounterApp).get('/limited')
    expect(resAllowed.statusCode).toBe(200)
  })
})
