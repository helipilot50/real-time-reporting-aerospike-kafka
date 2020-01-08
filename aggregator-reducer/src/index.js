const config = require('config');
const kafka = require('kafka-node');
const Aerospike = require('aerospike');
const sleep = require('sleep');
const { EventReceiver } = require('./event-receiver');

const asPort = parseInt(process.env.CORE_PORT);
const asHost = process.env.CORE_HOST;
const kafkaCluster = process.env.KAFKA_CLUSTER;
const waitFor = parseInt(process.env.SLEEP);

sleep.sleep(waitFor);

const app = async () => {
  try {

    let asClient = await Aerospike.connect({
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
    })

    console.log('Connected to aerospike', asHost, asPort);
    console.log('kafka cluster', kafkaCluster);

    let kafkaClient = new kafka.KafkaClient({
      autoConnect: true,
      kafkaHost: kafkaCluster
    });

    const eventReceiver = new EventReceiver(kafkaClient, asClient);


  } catch (error) {
    console.error(`Aggregator-Reducer error`, error);
    throw error;
  };

}

app();
