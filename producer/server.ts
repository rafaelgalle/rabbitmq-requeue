import * as amqplib from 'amqplib'

var queueWork = 'teste.queue.work';
var exWork = 'teste.exchange.work';

amqplib.connect('amqp://guest:guest@localhost')
  .then(conn => {
    conn.createChannel() 
      .then(ch => {
        ch.publish(exWork, '', Buffer.from(JSON.stringify('teste1')), {})
      }) 
  })