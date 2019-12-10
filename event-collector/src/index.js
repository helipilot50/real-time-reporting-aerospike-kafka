const express = require("express");
const bodyParser = require('body-parser');
const config = require('config');

const uuidv4 = require('uuid/v4');
const Aerospike = require('aerospike');
const sleep = require('sleep');

const asPort = parseInt(process.env.EDGE_PORT);
const asHost = process.env.EDGE_HOST;
console.log('Aerospike cluster', asHost, asPort);

const waitFor = parseInt(process.env.SLEEP);

sleep.sleep(waitFor);

let _client;

const asClient = async () => {

  if (!_client) {
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
      _client = client;
    }).catch(error => {
      console.error('Cannot connect to aerospike', error);
      throw error;
    });
  }
  return _client
}

const app = express();
const PORT = process.env.PORT || 4000
const EventRouter = express.Router();

const writeEvent = async (type, body) => {
  try {
    client = await asClient()
    const eventId = uuidv4();
    let clickKey = new Aerospike.Key(config.namespace, config.eventsSet, eventId);
    let bins = {};
    bins[config.eventIdBin] = eventId;
    bins[config.eventBin] = body;
    bins[config.tagBin] = body.tag;
    bins[config.bublisherBin] = body.publisher;
    bins[config.typeBin] = type;
    await client.put(clickKey, bins);
    console.log(`${type} event`, bins);
  } catch (error) {
    console.error(`${type} event processing error`, error);
  }
}

EventRouter.route('/impression').post(function (req, res) {
  writeEvent('impression', req.body);
});

EventRouter.route('/visit').post(function (req, res) {
  writeEvent('visit', req.body);
});

EventRouter.route('/conversion').post(function (req, res) {
  writeEvent('conversion', req.body);
});

EventRouter.route('/click').post(function (req, res) {
  writeEvent('click', req.body);
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/event', EventRouter);

app.listen(PORT, () => {
  console.log(`Event Collector running on port ${PORT}`);
});