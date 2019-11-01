const key = require('./key')

const express = require('express')
const bodyParse = require('body-parser')
const { Pool } = require('pg')
const redis = require('redis')

const cors = require('cors')

const app = express()
app.use(cors)

app.use(bodyParse.json())

const pgClient = new Pool({
    user: key.pgUser,
    host: key.pgHost,
    database: key.pgDatabase,
    password: key.pgPassword,
    port: key.pgPort
})

pgClient.on('error', ()=> console.log('Log PG connection'))

pgClient.query('CREATE TABLE IF NOT EXISTS values (number INT)')
.catch(err => console.log(err))


const redisClient = redis.createClient({

    hots: key.redisHost,
    port: key.redisPort,
    retry_strategy: () => 1000
})

const redisPulisher = redisClient.duplicate()


app.get('/',(req, res) => {
    res.send('Hi')
})

app.get('/values/all',async (req, res) => {
    const values = await pgClient.query('Select * from values')
    res.send(values.rows)
})

app.get('/values/current',async (req, res) => {
    redisClient.hgetall('values', (err, values) => {
        res.send(values)
    })
})

app.post('/values',async (req, res) => {
   const index = req.body.index
   if(parseInt(index) > 40) {
    return res.status(422).send('Index too high')
   }
   redisClient.hset('values', index, 'nothing yet')
   redisPulisher.publish('insert', index)
   pgClient.query('insert into values(number) VALUES($1)', [index])
   res.send({working: true})
})

app.listen(5000, err =>{
    console.log("Listening")
})