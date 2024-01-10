# Rate Limiter from scratch 🔥

## How to try it

## Code

<details>
  <summary>🍿 Fixed Window Counter</summary>

  How it works:
  1. Get IP of the one who requested.
  2. If IP doesn't exist, set a new value in `counters`.
  3. If IP exists. Check time difference.
  4. If difference between current and start time of IP's counter is greater than the rate limit window -> We reset the counter.
  5. OR If counter has not reached the request limit, increment it.
  6. ELSE Tell client 429, too many requests.

  ```ts
export const rateLimitMiddleware = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const ip = req.ip
  if (!ip) {
    res.status(500).send('No IP address found on request')
    return
  }

  const currentTime = Date.now()

  if (!counters.has(ip)) {
    counters.set(ip, { count: 1, startTime: currentTime })
    next()
    return
  }

  const windowCounter = counters.get(ip)

  if (windowCounter) {
    const difference = currentTime - windowCounter.startTime
    const isGreaterThanWindow = difference > rateLimitWindowInMs

    if (isGreaterThanWindow) {
      // Reset the counter for the new window
      windowCounter.count = 1
      windowCounter.startTime = currentTime
      next()
    } else if (windowCounter.count < requestLimitPerWindow) {
      // Increment the counter and allow the request
      windowCounter.count++
      next()
    } else {
      // Rate limit exceeded
      res.status(429).send('Too Many Requests')
    }
  }
}
  ```
</details>

<details>
  <summary>🍿 Token Bucket</summary>

  How it works:
  Token Bucket is a bit more difficult to understand. However, we can clarify it with an analogy. Imagine you have a bucket that is being filled with water at a constant rate through a tap. Each time you need water, you take a cup and scoop out some water from the bucket. The bucket represents your token bucket, and the water is the tokens. You can only scoop as much water as is available in the bucket. If the bucket is empty, you must wait until it fills up again to scoop more water. The rate at which the bucket fills up with water is the rate at which tokens are added to your bucket.

  At a high level:
  1. Each user has a bucket.
  2. When they make requests, we decrement some of their tokens.
  3. Every time they make requests, we try to refill the tokens.
  4. The refilling logic however is tied to the last time they refilled the bucket.
  5. An example would be if a user spams the requests, at some point `timeSinceLastRefillInSeconds` will be less than 1 if not 0.
  6. This would result in no new tokens being added.


  ```ts
// Class
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

// Usage
const buckets = new Map<string, TokenBucket>()

export const rateLimitMiddleware = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const ip = req.ip

  if (!ip) {
    res.status(500).send('No IP address found on request')
    return
  }

  const hasIpNoBucket = !buckets.has(ip)
  if (hasIpNoBucket) {
    buckets.set(ip, new TokenBucket(10, 1)) // Example: 10 tokens, refill 1 token/sec
  }

  const bucket = buckets.get(ip)
  if (bucket && bucket.allowRequest()) {
    next()
  } else {
    res.status(429).send('Too Many Requests')
  }
}
  ```
</details>

# What is a Rate Limiter?

A rate limiter is a tool that monitors the number of requests per unit of time that a client IP can send to an API endpoint. If the number of requests exceeds a certain threshold, the rate limiter will block the client IP from sending further requests for a certain period of time.

# Key Concepts

- **Limit:** The maximum number of requests that a client IP can send to an API endpoint per unit of time.
- **Window:** The unit of time that the rate limiter uses to track the number of requests sent by a client IP. It can be anything from seconds to days.
- **Identifier:** A unique attribute of a request that the rate limiter uses to identify the client IP.

# Designing a Rate Limiter

- Define the purpose of your rate limiter.
- Decide on the type of rate limiting e.g. fixed window, sliding window, etc.
- Type of Storage: In-memory or persistent storage.
- Request identifier: IP address, user IDs API key, etc.
- Counting and logging
- Code checks if request is within the limit or not.
- Send response to client.

# Silently dropping request

This can be better than returning 429 error to client. It's a trick to fool attackers thinking that the request has been accepted even when the rate limiter has actually dropped the request.

# Rate Limiting Strategies

## Fixed Window Counter

- **Mechanism**: The time frame (window) is fixed, like an hour or a day. The counter resets at the end of each window.
- **Use Case**: Simple scenarios where average rate limiting over time is sufficient.
- **Pros**: Easy to implement and understand.
- **Cons**: Can allow bursts of traffic at the window boundaries.

## Sliding Window Log

- **Mechanism**: Records the timestamp of each request in a log. The window slides with each request, checking if the number of requests in the preceding window exceeds the limit.
- **Use Case**: When a smoother rate limit is needed without allowing bursts at fixed intervals.
- **Pros**: Fairer and more consistent than fixed windows.
- **Cons**: More memory-intensive due to the need to store individual timestamps.

## Token Bucket

- **Mechanism**: A bucket is filled with tokens at a steady rate. Each request costs a token. If the bucket is empty, the request is either rejected or queued.
- **Use Case**: Useful for APIs or services where occasional bursts are acceptable.
- **Pros**: Allows for short bursts of traffic over the limit.
- **Cons**: Slightly complex to implement. Can be unfair over short time scales.

## Leaky Bucket

- **Mechanism**: Requests are added to a queue and processed at a steady rate. If the queue is full, new requests are discarded.
- **Use Case**: Ideal for smoothing out traffic and ensuring a consistent output rate.
- **Pros**: Ensures a very even rate of requests.
- **Cons**: Does not handle bursts well. Excess requests are simply dropped.

## Sliding Window Counter

- **Mechanism**: Similar to fixed window but smoother. The window slides with each request, combining the simplicity of fixed windows with some advantages of sliding log.
- **Use Case**: When you need a balance between fairness and memory efficiency.
- **Pros**: More consistent than fixed window, less memory usage than sliding log.
- **Cons**: Can be more complex to implement than fixed window.

## Rate Limiting with Queues

- **Mechanism**: Instead of rejecting excess requests, they are queued and processed when possible.
- **Use Case**: When losing requests is not acceptable, and delays are tolerable.
- **Pros**: No request is outright rejected.
- **Cons**: Can lead to high latency and resource consumption if the queue becomes too long.

# Fixed Window Counter

Imagine a movie theater that sells tickets for each show. They have a policy: only 100 tickets can be sold per hour. This is to manage the crowd and ensure a comfortable experience for everyone. Each hour is a 'window' of time. At the start of each hour (say, 2 PM), the ticket count resets, regardless of how many were sold in the previous hour. If they reach 100 tickets at 2:45 PM, no more tickets are sold until 3 PM, when the next window starts.

# Token Bucket

Imagine you have a bucket that is being filled with water at a constant rate through a tap. Each time you need water, you take a cup and scoop out some water from the bucket. The bucket represents your token bucket, and the water is the tokens. You can only scoop as much water as is available in the bucket. If the bucket is empty, you must wait until it fills up again to scoop more water. The rate at which the bucket fills up with water is the rate at which tokens are added to your bucket.
