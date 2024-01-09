const SECONDS_CONVERSION = 1000

export class TokenBucket {
  capacity: number
  tokens: number
  refillRatePerSeconds: number
  lastRefill: number

  constructor(capacity: number, refillRate: number) {
    this.capacity = capacity
    this.tokens = capacity
    this.refillRatePerSeconds = refillRate
    this.lastRefill = Date.now()
  }

  refill() {
    const now = Date.now()
    const timeSinceLastRefillInSeconds =
      (now - this.lastRefill) / SECONDS_CONVERSION

    // Add new tokens to the bucket since the last refill
    // Example: 10 tokens per second, 5 seconds since last refill = 50 new tokens
    // But don't exceed the capacity of the bucket
    // This way, if the bucket is not used for a long time, it will not be overflowing with tokens
    const newTokens = timeSinceLastRefillInSeconds * this.refillRatePerSeconds
    this.tokens = Math.min(this.capacity, this.tokens + newTokens)
    this.lastRefill = now
  }

  allowRequest(): boolean {
    this.refill()
    if (this.tokens >= 1) {
      this.tokens -= 1
      return true
    }
    return false
  }
}
