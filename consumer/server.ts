import * as amqplib from 'amqplib'

var exWork = 'e.work';
var queueWork = 'q.work';
var bindKeyWork = '';

var exWait = 'e.wait';
var queueWait = 'q.wait';
var bindKeyWait = '';

amqplib.connect('amqp://guest:guest@localhost')
  .then(conn => {
    conn.createChannel()
      .then(ch => {

        // Criando exchanges
        ch.assertExchange(exWait, 'topic', { durable: true });
        ch.assertExchange(exWork, 'topic', { durable: true });

        // Criando fila de espera com DLX configurada.
        ch.assertQueue(queueWait, { durable: true, deadLetterExchange: exWork })
          .then(q => {
              // Criando ligação entre fila de espera e exchange de espera.
              ch.bindQueue(q.queue, exWait, bindKeyWait);

              // Observer que criamos a fila mas não iniciamos um consumidor para ela,
              // fazendo com que a mensagem publicada seja expirada de acordo com seu TTL
              // e redirecionada para a DLX configurada, retornando para a exchange de trabalho
          });

        // Criando fila de trabalho
        ch.assertQueue(queueWork, { durable: true })
        .then(q => {
            // Criando ligação entre fila e exchange
            ch.bindQueue(q.queue, exWork, bindKeyWork);

            // Iniciando um consumidor para a fila, ele irá consumir e processar cada nova
            // mensagem que a fila receber
            ch.consume(q.queue, function (msg: any) {
                console.log('## CONSUMINDO MENSAGEM ## ')
                console.log('## FILA: ' + q.queue)
                Process(ch, msg)
            }, { noAck: true });
        });
      })
  })

function Process(ch: any, msg: any){
  // Buscando quantas vezes essa mensagem foi processada
  let count = msg.properties.headers.count ? msg.properties.headers.count : 1
  // Setando options da mensagem com ttl de 5 segundos e header contendo o contador
  let options = { expiration: 5000, headers: { 'count': ++count }}
  if (count > 5) return console.log('## Escapando por exceder limite de tentativas')
  // Publicando mensagem em exchange de espera com TTL definido
  ch.publish(exWait, bindKeyWait, Buffer.from(msg.content.toString()), options)
  console.log('## Simulando erro - Publicando em fila de espera')
}