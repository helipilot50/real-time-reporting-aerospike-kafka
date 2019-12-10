const request = require('request')
const uuidv4 = require('uuid/v4');
const Aerospike = require('aerospike');
const config = require('config');
const sleep = require('sleep');

const PORT = process.env.PORT || 4000
const asPort = parseInt(process.env.CORE_PORT);
const asHost = process.env.CORE_HOST;
const INTERVAL = parseInt(process.env.EVENT_INTERVAL);
console.log('Aerospike cluster', asHost, asPort);

const waitFor = parseInt(process.env.SLEEP);

sleep.sleep(waitFor);

let asClient;

Aerospike.connect({
  hosts: [
    { addr: asHost, port: asPort }
  ],
  policies: {
    read: new Aerospike.ReadPolicy({
      totalTimeout: 500
    }),
    write: new Aerospike.WritePolicy({
      totalTimeout: 500
    }),
  },
  log: {
    level: Aerospike.log.INFO
  }
}).then(client => {
  asClient = client;
}).catch(error => {
  console.error('Cannot connect to aerospike', error);
  throw error;
});

const eventTypes = [
  'impression',
  'impression',
  'impression',
  'impression',
  'impression',
  'impression',
  'impression',
  'impression',
  'impression',
  'impression',
  'impression',
  'impression',
  'impression',
  'impression',
  'impression',
  'impression',
  'impression',
  'impression',
  'impression',
  'impression',
  'impression',
  'impression',
  'impression',
  'impression',
  'impression',
  'click',
  'click',
  'click',
  'click',
  'click',
  'click',
  'click',
  'click',
  'visit',
  'visit',
  'visit',
  'conversion',
];

const randomEvent = () => {
  let index = Math.floor(Math.random() * eventTypes.length);
  return eventTypes[index];
};

const intervalFunc = async () => {
  try {

    let event = randomEvent();

    let index = Math.floor(Math.random() * 100000);
    let tagKey = new Aerospike.Key(config.namespace, config.tagSet, index);
    let record = await asClient.get(tagKey);
    let tag = record.bins[config.tagIdBin];

    let publisher = uuidv4();

    let url = `http://event-collector:${PORT}/event/${event}`
    console.log('URL:', url);

    console.log(`Event: ${event}, Tag: ${tag}, Publisher: ${publisher}`)
    request.post(url, {
      json: {
        tag: tag,
        publisher: publisher,
      }
    });
  } catch (error) {
    console.error('send event error', error);
  }

}


setInterval(intervalFunc, INTERVAL);


