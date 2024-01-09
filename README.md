# Rate Limiter from scratch

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
