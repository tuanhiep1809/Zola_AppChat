const redis = require('redis');
// const client = redis.createClient({
//     password: 'MG9yJozQpn8K3Se6nb7tIall6gxhHyPc',
//     socket: {
//         host: 'redis-13878.c1.ap-southeast-1-1.ec2.redns.redis-cloud.com',
//         port: 13878
//     }
// });
const client = redis.createClient(); 

const connectToRedis = async () => {
    if (!client.isOpen) {
        await client.connect()
        console.log('Connected to Redis')
    }
}

connectToRedis().catch(console.error);

client.on('error', (error) => {
    console.error('Redis Error: ', error);
});

module.exports = client;