const config = require('config');
const kafka = require('kafka-node');
const Aerospike = require('aerospike');
const sleep = require('sleep');

const asPort = parseInt(process.env.CORE_PORT);
const asHost = process.env.CORE_HOST;

const eventTopic = process.env.EVENT_TOPIC;

const waitFor = parseInt(process.env.SLEEP);

sleep.sleep(waitFor);

const Consumer = kafka.Consumer;
const kafkaClient = new kafka.KafkaClient();
const kafkaConsumer = new Consumer(
  kafkaClient,
  [
    { topic: eventTopic, partition: 0 }
  ],
  {
    autoCommit: false
  }
);

let asClient;

const aggregateEvent = async (type, body) => {
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

    let clickKey = new Aerospike.Key(config.namespace, config.eventsSet, eventId);
    let bins = {};
    bins[config.eventIdBin] = eventId;
    bins[config.eventBin] = body;
    bins[config.tagBin] = body.tag;
    switch (type) {
      case 'click':
        bins[config.sourceBin] = body.publisher;
        break;
      case 'impression':
        bins[config.sourceBin] = body.publisher;
        break;
      case 'visit':
        bins[config.sourceBin] = body.advertiser;
        break;
      case 'conversion':
        bins[config.sourceBin] = body.vendor;
        break;
    }
    bins[config.typeBin] = type;
    await asClient.put(clickKey, bins);
    console.log(`Processed ${type} event`, eventId);
  } catch (error) {
    console.error(`${type} event processing error`, eventId);
    throw error;
  }
}

kafkaConsumer.on('message', function (message) {
  console.log(message);
  // aggregateEvent() here
});

kafkaConsumer.on('error', function (err) {
  console.log(err);
});

kafkaConsumer.on('offsetOutOfRange', function (err) {
  console.log(err);
});