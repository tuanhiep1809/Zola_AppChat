const RedisService = require('./RedisService')
const redisClient = require('../db/redis');
const test = async (key) => {
    const value = await redisClient.exists(key);
    console.log(value)
}

test("asdfsadf"); 