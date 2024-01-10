import supertest from 'supertest'
import { describe, expect, it } from 'vitest'

import { TokenBucketApp } from './app'
import { capacity } from './rateLimitMiddleware'

describe('Token Bucket', () => {
  it('/unlimited should allow unlimited requests', async () => {
    for (let i = 0; i < 20; i++) {
      const res = await supertest(TokenBucketApp).get('/unlimited')
      expect(res.statusCode).toBe(200)
    }
  })

  it('/limited should rate limit requests', async () => {
    const ip = '127.0.0.1' // Mock IP for testing
    const requests = 15

    for (let i = 0; i < requests; i++) {
      const res = await supertest(TokenBucketApp)
        .get('/limited')
        .set('X-Forwarded-For', ip)
      if (i < capacity) {
        expect(res.statusCode).toBe(200)
      } else {
        expect(res.statusCode).toBe(429)
      }
    }
  })
})
