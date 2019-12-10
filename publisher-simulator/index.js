const request = require('request')
const uuidv4 = require('uuid/v4');
const Aerospike = require('aerospike');

const PORT = process.env.PORT || 4000
const asPort = parseInt(process.env.CORE_PORT);
const asHost = process.env.CORE_HOST;
console.log('Aerospike cluster', asHost, asPort);

let _client;

const asClient = async () => {
  if (!_client) {
    try {
      const asConfig = {
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
      };
      _client = await Aerospike.connect(asConfig);
    } catch (error) {
      console.error('Cannot connect to aerospike', error);
      throw error;
    }
  }
  return _client;
}



const eventTypes = [
  'click',
  'impression',
  'visit',
  'conversion',
];

const randomEvent = () => {
  let index = Math.floor(Math.random() * eventTypes.length);
  return eventTypes[index];
}

function intervalFunc() {

  let event = randomEvent();

  let tag = randomTag();

  let publisher = uuidv4();

  let url = `http://event-collector:${PORT}/event/${event}`

  try {
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

setInterval(intervalFunc, 1500);


