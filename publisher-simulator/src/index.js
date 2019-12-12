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
  'visit',
  'visit',
  'visit',
  'conversion',
];

const randomEvent = () => {
  let index = Math.floor(Math.random() * eventTypes.length);
  return eventTypes[index];
};


const UserAgents = [
  'Samsung Galaxy S6',
  'Nexus 6P',
  'Sony Xperia Z5',
  'HTC One X10',
  'Samsung Galaxy S9',
  'Apple iPhone XR (Safari)',
  'Apple iPhone XS (Chrome)',
  'Apple iPhone X',
  'Apple iPhone 8',
  'Microsoft Lumia 950',
  'Google Pixel C',
  'Samsung Galaxy Tab S3',
  'Mozilla/5.0 (X11; CrOS x86_64 8172.45.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.64 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/601.3.9 (KHTML, like Gecko) Version/9.0.2 Safari/601.3.9',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.246',
  'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.111 Safari/537.36',
  'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:15.0) Gecko/20100101 Firefox/15.0.1',
];

const randomUserAgent = () => {
  let index = Math.floor(Math.random() * UserAgents.length);
  return UserAgents[index];
};

const geo = [
  [55.678540, 12.594594],
  [50.110326, 8.681470],
  [48.853886, 2.291332],
  [52.366521, 4.894981],
  [37.385752, -122.081889],
  [-21.353117, -42.980347],
  [-32.804297, 151.840066]
];

const randomGeo = () => {
  let index = Math.floor(Math.random() * geo.length);
  return geo[index];
};

const intervalFunc = async () => {
  try {

    let event = randomEvent();

    let index = Math.floor(Math.random() * 100000);
    let tagKey = new Aerospike.Key(config.namespace, config.tagSet, index);
    let record = await asClient.get(tagKey);
    let tag = record.bins[config.tagIdBin];

    let sourceId = uuidv4();
    let options = {
      uri: `http://event-collector:${PORT}/event/${event}`,
      headers: {
        'User-Agent': randomUserAgent()
      },
      json: {
        event: event,
        tag: tag,
        geo: randomGeo(),
      }
    };

    switch (event) {
      case 'click':
        options.json['publisher'] = sourceId;
        break;
      case 'impression':
        options.json['publisher'] = sourceId;
        break;
      case 'visit':
        options.json['advertiser'] = sourceId;
        break;
      case 'conversion':
        options.json['vendor'] = sourceId;
        break;
    }


    console.log(`Event: ${options.json}`)
    request.post(options);
  } catch (error) {
    console.error('send event error', error);
  }

}


setInterval(intervalFunc, INTERVAL);


