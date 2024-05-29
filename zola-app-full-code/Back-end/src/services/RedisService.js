const {promisify} = require('util');
const redisClient = require('../db/redis');

// const getAsync = promisify(redisClient.get).bind(redisClient);
// const mGetAsync = promisify(redisClient.mGet).bind(redisClient);
// const setAsync = promisify(redisClient.set).bind(redisClient);
// const existsAsync = promisify(redisClient.exists).bind(redisClient);
// const lPushAsync = promisify(redisClient.lPush).bind(redisClient);
// const rPushAsync = promisify(redisClient.rPush).bind(redisClient);
// const lrangeAsync = promisify(redisClient.lRange).bind(redisClient);
// const ltrimAsync = promisify(redisClient.lTrim).bind(redisClient);
// const lremAsync = promisify(redisClient.lRem).bind(redisClient);
// const lpopAsync = promisify(redisClient.lPop).bind(redisClient);
// const rpopAsync = promisify(redisClient.rPop).bind(redisClient);
// const delAsync = promisify(redisClient.del).bind(redisClient);
// const msetAsync = promisify(redisClient.mSet).bind(redisClient);


const TIME_OUT = 60*60*24*7; // 1 week
const get = async (key) => {
  // console.log("get redis key: ", key);
  const value = await redisClient.get(key);
  await redisClient.expire(key, TIME_OUT);
  // console.log("get redis value: ", JSON.parse(value));
  return JSON.parse(value);
}

const set = async (key, value, EX=TIME_OUT) => {
  // console.log("set redis key: ", key);
  await redisClient.set(key, JSON.stringify(value),{EX});
}

const setXX = async (key, value, EX=TIME_OUT) => {
  await redisClient.set(key, JSON.stringify(value),{EX, XX:true});
}

const mGet = async (keys) => {
  const value = await redisClient.mGet(keys);
  return JSON.parse(value);
}

const exists = async (key) => {
  return await redisClient.exists(key);
}

const lPush = async (key, value) => {
  // console.log("push redis key: ", key);
  await redisClient.lPush(key, JSON.stringify(value));
  await redisClient.expire(key, TIME_OUT);
}

const rPush = async (key, value) => {
    // console.log("push redis key: ", key);
    await redisClient.rPush(key, JSON.stringify(value));
    await redisClient.expire(key, TIME_OUT);
}

const lRange = async (key, start, end) => {
    console.log("lRange redis key: ", key);
    let result = await redisClient.lRange(key, start, end);
    await redisClient.expire(key, TIME_OUT);
    result = result.map(item => JSON.parse(item));
    return result;
}

const ltrim = async (key, start, end) => {
  let result = await redisClient.lTrim(key, start, end);
  await redisClient.expire(key, TIME_OUT);
  result = result.map(item => JSON.parse(item));
  return result;
}

const lSet = async (key, index, value) => {
    await redisClient.lSet(key, index, JSON.stringify(value));
    await redisClient.expire(key, TIME_OUT);
}

const lLen = async (key) => {
    return await redisClient.lLen(key);
}

const lRem = async (key, count, value) => {
    await redisClient.lRem(key, count, JSON.stringify(value));
}

const del = async (key) => {
    await redisClient.del(key);
}

module.exports = {
    set,
    get,
    mGet,
    exists, 
    lPush,
    rPush, 
    lRange,
    ltrim,
    lSet,
    lLen,
    lRem,
    setXX,
    del,
}

    


