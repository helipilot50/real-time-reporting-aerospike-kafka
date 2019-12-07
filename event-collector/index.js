const express = require("express");
const bodyParser = require('body-parser');
const config = require('config');

const uuidv4 = require('uuid/v4');
const Aerospike = require('aerospike');

let _client;

const asClient = () => {
  if (!_client) {
    try {
      _client = Aerospike.client({
        hosts: [
          { addr: 'core-aerospikedb', port: 3000 }
        ],
        log: {
          level: aerospike.log.INFO
        }
      }).connect();

    } catch (error) {
      console.log('Cannot connect to aerospike', error);
    }
  }
  return _client;
}

const app = express();
const PORT = process.env.PORT || 3000
const EventRouter = express.Router();

/*
DELIBERATELY verbose express router code
showing aerospike put operation specific
to each type of event
*/
EventRouter.route('/click').post(function (req, res) {
  try {
    const eventId = uuidv4();
    let clickKey = new Aerospike.Key(config.namespace, config.eventsSet, eventId);
    let bins = {};
    bins[config.eventIdBin] = eventId;
    bins[config.eventBin] = req.body;
    bins[config.tagBin] = req.body.tag;
    bins[config.bublisherBin] = req.body.publisher;
    bins[config.typeBin] = 'click';
    asClient.put(clickKey, bins);
    console.log('click event', bins);
  } catch (error) {
    console.error('click event processing error', error);
  }
});

EventRouter.route('/impression').post(function (req, res) {
  try {
    const eventId = uuidv4();
    let clickKey = new Aerospike.Key(config.namespace, config.eventsSet, eventId);
    let bins = {};
    bins[config.eventIdBin] = eventId;
    bins[config.eventBin] = req.body;
    bins[config.tagBin] = req.body.tag;
    bins[config.bublisherBin] = req.body.publisher;
    bins[config.typeBin] = 'impression';
    asClient.put(clickKey, bins);
    console.log('impression event', bins);
  } catch (error) {
    console.error('impression event processing error', error);
  }
});

EventRouter.route('/visit').post(function (req, res) {
  try {
    const eventId = uuidv4();
    let clickKey = new Aerospike.Key(config.namespace, config.eventsSet, eventId);
    let bins = {};
    bins[config.eventIdBin] = eventId;
    bins[config.eventBin] = req.body;
    bins[config.tagBin] = req.body.tag;
    bins[config.bublisherBin] = req.body.publisher;
    bins[config.typeBin] = 'visit';
    asClient.put(clickKey, bins);
    console.log('visit event', bins);
  } catch (error) {
    console.error('visit event processing error', error);
  }
});
EventRouter.route('/conversion').post(function (req, res) {
  try {
    const eventId = uuidv4();
    let clickKey = new Aerospike.Key(config.namespace, config.eventsSet, eventId);
    let bins = {};
    bins[config.eventIdBin] = eventId;
    bins[config.eventBin] = req.body;
    bins[config.tagBin] = req.body.tag;
    bins[config.bublisherBin] = req.body.publisher;
    bins[config.typeBin] = 'visconversionit';
    asClient.put(clickKey, bins);
    console.log('conversion event', bins);
  } catch (error) {
    console.error('conversion event processing error', error);
  }
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/event', EventRouter);

app.listen(PORT, () => {
  console.log(`Event Collector running on port ${PORT}`);
});