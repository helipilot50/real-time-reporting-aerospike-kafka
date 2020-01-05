const config = require('config');
const kafka = require('kafka-node');
const Aerospike = require('aerospike');
const sleep = require('sleep');
const { EventReceiver } = require('./event-receiver');

const asPort = parseInt(process.env.CORE_PORT);
const asHost = process.env.CORE_HOST;

const waitFor = parseInt(process.env.SLEEP);

sleep.sleep(waitFor);

const kafkaClient = new kafka.KafkaClient({
  autoConnect: true,
  kafkaHost: config.kafka_server
});

let asClient;

const aerospikeClient = async () => {
  try {

    if (!asClient) {
      console.log('Attempting to connect to Aerospike cluster', asHost, asPort);

      Aerospike.connect({
        hosts: [
          { addr: asHost, port: asPort }
        ],
        policies: {
          read: new Aerospike.ReadPolicy({
            totalTimeout: 100
          }),
          write: new Aerospike.WritePolicy({
            totalTimeout: 100
          }),
        },
        log: {
          level: Aerospike.log.INFO
        }
      }).then(client => {
        asClient = client;
        console.log('Connected to aerospike', asHost, asPort);
      }).catch(error => {
        console.error('Cannot connect to aerospike', error);
        throw error;
      });
    }
    return asClient

  } catch (error) {
    console.error(`Aerospike connection error`, error);
    throw error;
  }


}

const eventReceiver = new EventReceiver(kafkaClient, await aerospikeClient());
