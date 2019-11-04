const key = require('./key')
const redis = require('redis')

const redisClient= redis.createClient({
    host: key.redisHost,
    port: key.redisPort,
    retry_strategy: () => 1000

})

const sub = redisClient.duplicate()

function fib(index){
    if(index<2) return 1;
    return fib(index-1)+ fib(index-2)
}

sub.on('message', (channle, message)=>{
    redisClient.hset('value', 'message', fib(parseInt(message)))
})

sub.subscribe('insert')