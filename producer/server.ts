import * as amqplib from 'amqplib'

var queueWork = 'q.work';
var exWork = 'e.work';

amqplib.connect('amqp://guest:guest@localhost')
  .then(conn => {
    conn.createChannel() 
      .then(ch => {
        ch.publish(exWork, '', Buffer.from(JSON.stringify('teste1')), {})
      }) 
  })