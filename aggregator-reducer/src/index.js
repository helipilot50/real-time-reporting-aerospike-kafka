const kafka = require('kafka-node');
const Aerospike = require('aerospike');
const sleep = require('sleep');
const { EventReceiver } = require('./event-receiver');

const asPort = parseInt(process.env.CORE_PORT);
const asHost = process.env.CORE_HOST;
const kafkaCluster = process.env.KAFKA_CLUSTER;
const waitFor = parseInt(process.env.SLEEP);

sleep.sleep(waitFor);

const connectToKafka = () => {
  try {
    let kafkaClient = new kafka.KafkaClient({
      autoConnect: true,
      kafkaHost: kafkaCluster
    });
    console.log('Connected to Kafka', kafkaCluster);
    return kafkaClient;
  } catch (kafkaError) {
    console.error(`Kafka error - retrying in 5 secs`, error);
    setTimeout(connectToKafka, 5000);
  }
};

const app = async () => {
  try {

    let asClient = await Aerospike.connect({
      hosts: [
        { addr: asHost, port: asPort }
      ],
      policies: {
        read: new Aerospike.ReadPolicy({
          totalTimeout: 1000
        }),
        write: new Aerospike.WritePolicy({
          totalTimeout: 1000
        }),
      },
      log: {
        level: Aerospike.log.INFO
      },
      maxConnsPerNode: 1000
    });

    console.log('Connected to aerospike', asHost, asPort);

    let kafkaClient = connectToKafka();

    const eventReceiver = new EventReceiver(kafkaClient, asClient);

  } catch (error) {
    console.error(`Aggregator-Reducer error`, error);
    throw error;
  };

}

app();
