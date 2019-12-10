const express = require("express");
const bodyParser = require('body-parser');
const config = require('config');

const uuidv4 = require('uuid/v4');
const Aerospike = require('aerospike');
const sleep = require('sleep');

const asPort = parseInt(process.env.EDGE_PORT);
const asHost = process.env.EDGE_HOST;

const waitFor = parseInt(process.env.SLEEP);

sleep.sleep(waitFor);

let asClient;

const app = express();
const PORT = process.env.PORT || 4000
const EventRouter = express.Router();

const writeEvent = async (type, body) => {
  try {

    if (!asClient) {
      console.log('Attempting to connect to Aerospike cluster', asHost, asPort);

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
        console.log('Connected to aerospike', asHost, asPort);
      }).catch(error => {
        console.error('Cannot connect to aerospike', error);
        throw error;
      });
    }

    const eventId = uuidv4();
    let clickKey = new Aerospike.Key(config.namespace, config.eventsSet, eventId);
    let bins = {};
    bins[config.eventIdBin] = eventId;
    bins[config.eventBin] = body;
    bins[config.tagBin] = body.tag;
    bins[config.bublisherBin] = body.publisher;
    bins[config.typeBin] = type;
    await asClient.put(clickKey, bins);
    console.log(`${type} event`, bins);
  } catch (error) {
    console.error(`${type} event processing error`, error);
    throw error;
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
  // console.log('Attempting to connect to Aerospike cluster', asHost, asPort);

  // Aerospike.connect({
  //   hosts: [
  //     { addr: asHost, port: asPort }
  //   ],
  //   policies: {
  //     read: new Aerospike.ReadPolicy({
  //       totalTimeout: 500
  //     }),
  //     write: new Aerospike.WritePolicy({
  //       totalTimeout: 500
  //     }),
  //   },
  //   log: {
  //     level: Aerospike.log.INFO
  //   }
  // }).then(client => {
  //   asClient = client;
  //   console.log('Connected to aerospike', asHost, asPort);
  // }).catch(error => {
  //   console.error('Cannot connect to aerospike', error);
  //   throw error;
  // });
});