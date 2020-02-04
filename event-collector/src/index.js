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

let _asClient;

const asClient = async function () {
  try {
    if (!_asClient) {
      _asClient = await Aerospike.connect({
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
        },
        maxConnsPerNode: 1000
      });
      console.log('Aerospike client connection OK');
    }
    return _asClient;
  } catch (err) {
    let errorMessage = `Failed to connect to Aerospike - ${err}`;
    throw new Error(errorMessage);
  }
};

const app = express();
const PORT = process.env.PORT || 4000
const EventRouter = express.Router();

const writeEvent = async (type, body) => {
  const eventId = uuidv4();
  try {

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
    let client = await asClient();
    await client.put(clickKey, bins);
    console.log(`Processed ${type} event`, eventId);
  } catch (error) {
    console.error(`${type} event processing error`, eventId);
    throw error;
  }
}

const applyUserAgent = (req) => {
  req.body.userAgent = req.headers['user-agent'];
  console.log('event:', req.body);
};

EventRouter.route('/impression').post(function (req, res) {
  applyUserAgent(req);
  writeEvent('impression', req.body);
});

EventRouter.route('/visit').post(function (req, res) {
  applyUserAgent(req);
  writeEvent('visit', req.body);
});

EventRouter.route('/conversion').post(function (req, res) {
  applyUserAgent(req);
  writeEvent('conversion', req.body);
});

EventRouter.route('/click').post(function (req, res) {
  applyUserAgent(req);
  writeEvent('click', req.body);
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/event', EventRouter);

app.listen(PORT, () => {
  console.log(`Event Collector running on port ${PORT}`);
});