import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

// redis connection 
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Options for redis
const redisOptions: any = {
    maxRetriesPerRequest: null
};

// For Upstash/production using rediss (TLS)
if (redisUrl.startsWith('rediss://')) {
    // Avoid IPv6 resolution timeouts on Render
    redisOptions.family = 0;
    
    // Bypass strict unauthorized checks if required
    redisOptions.tls = { rejectUnauthorized: false };
}

// Initialize redis
const redis = new Redis(redisUrl, redisOptions);

// Event listeners for redis
redis.on('connect', () => {
    console.log('Connected to Redis');
});

redis.on('error', (err) => {
    console.error('Redis error:', err);
});

export default redis;
