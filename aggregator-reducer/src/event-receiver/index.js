const config = require('config');
const kafka = require('kafka-node');
const Aerospike = require('aerospike');
const HighLevelProducer = kafka.HighLevelProducer;
const Consumer = kafka.Consumer;
const eventTopic = process.env.EVENT_TOPIC;
const subscriptionTopic = process.env.SUBSCRIPTION_TOPIC;



const accumulateInCampaign = async (campaignId, eventSource, eventData, asClient) => {
  try {
    // Aerospike CDT operation returning the new DataCube
    let campaignKey = new Aerospike.Key(config.namespace, config.campaignSet, campaignId);
    const kvops = Aerospike.operations;
    const maps = Aerospike.maps;
    const kpiKey = eventData.event + 's';
    const ops = [
      kvops.read(config.statsBin),
      // kvops.read(config.campaignIdBin),
      // kvops.read(config.campaignNameBin),
      maps.increment(config.statsBin, kpiKey, 1),
      // maps.increment(config.statsBin, [eventSource, kpiKey], 1),  <=== future sub-context evaluation
    ];
    let record = await asClient.operate(campaignKey, ops);
    let kpis = record.bins[config.statsBin];
    console.log(`Campaign ${campaignId} KPI ${kpiKey} processed with result:`, JSON.stringify(record.bins, null, 2));
    return {
      key: kpiKey,
      value: kpis
    };
  } catch (err) {
    console.error('accumulateInCampain Error:', err);
    throw err;
  }
};

const addTopic = function (consumer, topic) {
  consumer.addTopics([topic], function (error, thing) {
    if (error) {
      console.error('Add topic error - retry in 5 sec', error.message);
      setTimeout(
        addTopic,
        5000, consumer, topic);
    }
  });
};

class EventReceiver {
  constructor(kafkaClient, aerospikeClient) {
    this.kafkaClient = kafkaClient;
    this.aerospikeClient = aerospikeClient;
    this.topic = {
      topic: eventTopic,
      partition: 0
    };
    this.consumer = new Consumer(
      kafkaClient,
      [],
      {
        autoCommit: true,
        fromOffset: false
      }
    );

    let subscriptionPublisher = new SubscriptionEventPublisher(kafkaClient);

    addTopic(this.consumer, this.topic);

    this.consumer.on('message', async function (eventMessage) {

      try {
        let payload = JSON.parse(eventMessage.value);
        // Morph the array of bins to and object
        let bins = payload.bins.reduce(
          (acc, item) => {
            acc[item.name] = item;
            return acc;
          },
          {}
        );
        // extract the event data value
        let eventValue = bins['event-data'].value;
        // extract the Tag id
        let tagId = eventValue.tag;
        // extract source e.g. publisher, vendor, advertiser
        let source = bins['event-source'].value;
        //lookup the Tag id in Aerospike to obtain the Campaign id
        let tagKey = new Aerospike.Key(config.namespace, config.tagSet, tagId);
        let tagRecord = await aerospikeClient.select(tagKey, [config.campaignIdBin]);
        // get the campaign id
        let campaignId = tagRecord.bins[config.campaignIdBin];
        // aggregate in campaign 
        const accumulatedKPI = await accumulateInCampaign(campaignId, source, eventValue, aerospikeClient);
        // publish kafka for GraphQL subscription
        subscriptionPublisher.publishKPI(campaignId, accumulatedKPI)

      } catch (error) {
        console.error('on Message:', error);
      }
    });

    this.consumer.on('error', function (err) {
      console.error('Kafka Error:', err);
    });


    this.consumer.on('offsetOutOfRange', function (err) {
      topic.maxNum = 2;
      offset.fetch([topic], function (err, offsets) {
        if (err) {
          return console.error(err);
        }
        var min = Math.min.apply(null, offsets[topic.topic][topic.partition]);
        consumer.setOffset(topic.topic, topic.partition, min);
      });

    });
  }

}

class SubscriptionEventPublisher {
  constructor(kafkaClient) {
    this.producer = new HighLevelProducer(kafkaClient);
  };

  publishKPI(campaignId, accumulatedKpi) {
    const subscriptionMessage = {
      campaignId: campaignId,
      kpi: accumulatedKpi.key,
      value: accumulatedKpi.value
    };
    const producerRequest = {
      topic: subscriptionTopic,
      messages: JSON.stringify(subscriptionMessage),
      timestamp: Date.now()
    };

    this.producer.send([producerRequest], function (err, data) {
      if (err)
        console.error('publishKPI error', err);
      // else
      // console.log('Campaign KPI published:', subscriptionMessage);
    });
  };
}

module.exports = {
  EventReceiver,
  SubscriptionEventPublisher
}