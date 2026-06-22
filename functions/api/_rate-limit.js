// Rate Limiting Helper for Cloudflare Functions
// Uses Cloudflare's built-in rate limiting or in-memory tracking

const RATE_LIMITS = {
  'api/auth': { max: 10, window: 60 }, // 10 requests per minute for auth
  'api/tokens': { max: 30, window: 60 }, // 30 requests per minute for tokens
  'default': { max: 60, window: 60 } // 60 requests per minute for others
};

// In-memory rate limit store (resets on cold start)
const rateLimitStore = new Map();

export function checkRateLimit(endpoint, clientIP) {
  const limit = RATE_LIMITS[endpoint] || RATE_LIMITS['default'];
  const key = `${clientIP}:${endpoint}`;
  const now = Date.now();
  const windowStart = now - (limit.window * 1000);
  
  // Get or create request history
  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, []);
  }
  
  const requests = rateLimitStore.get(key);
  
  // Remove old requests outside window
  const validRequests = requests.filter(time => time > windowStart);
  rateLimitStore.set(key, validRequests);
  
  // Check if limit exceeded
  if (validRequests.length >= limit.max) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: Math.ceil((validRequests[0] + limit.window * 1000) / 1000)
    };
  }
  
  // Add current request
  validRequests.push(now);
  rateLimitStore.set(key, validRequests);
  
  return {
    allowed: true,
    remaining: limit.max - validRequests.length,
    resetAt: Math.ceil((now + limit.window * 1000) / 1000)
  };
}

export function getRateLimitHeaders(result) {
  return {
    'X-RateLimit-Limit': String(RATE_LIMITS['default'].max),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(result.resetAt)
  };
}
