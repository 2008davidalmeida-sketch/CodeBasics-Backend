import { Queue } from 'bullmq';
import redis from '../config/redis';

// the connection is shared with the existing redis client
const connection = redis;

// Queue name
export const SUBMISSION_QUEUE_NAME = 'submission-queue';

// Queue
export const submissionQueue = new Queue(SUBMISSION_QUEUE_NAME, {
    connection,
});

console.log('Submission Queue initialized');
