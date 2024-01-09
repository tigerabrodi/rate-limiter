import supertest from 'supertest'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { FixedWindowCounterApp } from './app'

describe('Fixed Window Counter Rate Limiter Tests', () => {
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
      const res = await supertest(FixedWindowCounterApp).get('/unlimited')
      expect(res.statusCode).toBe(200)
    }
  })

  it('/limited should allow requests within rate limit', async () => {
    const rateLimit = 10 // Assuming rate limit is 10 requests

    for (let i = 0; i < rateLimit; i++) {
      const res = await supertest(FixedWindowCounterApp).get('/limited')
      expect(res.statusCode).toBe(200)
    }
  })

  it('/limited should reject requests exceeding rate limit', async () => {
    const windowDurationInSeconds = 60
    const rateLimit = 10 // Assuming rate limit is 10 requests

    // Perform requests within rate limit
    for (let i = 0; i < rateLimit; i++) {
      await supertest(FixedWindowCounterApp).get('/limited')
    }

    // Advance time to simulate end of rate limit window
    vi.advanceTimersByTime(windowDurationInSeconds * 1000)

    // One more request should be allowed as the window has reset
    const res = await supertest(FixedWindowCounterApp).get('/limited')
    expect(res.statusCode).toBe(200)

    // Another request should be rejected as the rate limit has been exceeded
    const res2 = await supertest(FixedWindowCounterApp).get('/limited')
    expect(res2.statusCode).toBe(429)
  })
})
