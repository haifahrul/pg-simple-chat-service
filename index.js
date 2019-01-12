// Require the framework and instantiate it
require('dotenv').config()

var EventEmitter = require('events');
var util = require('util');

function DbEventEmitter(){
    EventEmitter.call(this);
}

util.inherits(DbEventEmitter, EventEmitter);
var dbEventEmitter = new DbEventEmitter;


dbEventEmitter.on('new_message', (msg) => {
    console.log('New message received: ' + JSON.stringify(msg));
});

const fastify = require('fastify')({
    logger: true
})

fastify.register(require('fastify-postgres'), {
    connectionString: process.env['PG_URL']
})


 
// fastify.get('/', async (request, reply) => {
//     console.log(request.query['table'])
    
//     let table = 'conversation'
//     if(request.query['table']) {
//         table = request.query['table']
//     }
//     const client = await fastify.pg.connect()
//     const { rows } = await client.query(
//         `SELECT * FROM ${table};`
//     )
//     client.release()

//   return rows
// })
  
// Run the server!
const start = async () => {
try {
    await fastify.listen(process.env['PORT'] || 3001)
    fastify.log.info(`server listening on ${fastify.server.address().port}`)

    const client = await fastify.pg.connect()

    client.on('notification', function(msg) {
        let payload = JSON.parse(msg.payload);
        dbEventEmitter.emit(msg.channel, payload);
    });

    // Designate which channels we are listening on. Add additional channels with multiple lines.
    client.query('LISTEN new_message');


    
} catch (err) {
    fastify.log.error(err)
    process.exit(1)
}
}
start()