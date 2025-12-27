import Queue from 'bull';

// Define Redis connection details
const redisConfig = {
    host: 'localhost', // Redis server address
    port: 6379,        // Redis server port
};

// Create a queue with the specified Redis connection
//firstQueue is the 30 sec window queue that i will use for initial seat locking
const firstQueue = new Queue('firstQueue', { redis: redisConfig });
const secondQueue = new Queue('secondQueue', { redis: redisConfig });
const seatsQueue = new Queue('seatsQueue', { redis: redisConfig });

export { firstQueue, secondQueue };
// Enqueue a job
//myQueue.add({ foo: 'bar' });
