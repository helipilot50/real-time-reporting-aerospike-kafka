const config = require('config');
const kafka = require('kafka-node');
const Aerospike = require('aerospike');
const HighLevelProducer = kafka.HighLevelProducer;
const Consumer = kafka.Consumer;
const eventTopic = process.env.EVENT_TOPIC;
const subscriptionTopic = process.env.SUBSCRIPTION_TOPIC;



const accumulateInCampaign = async (campaignId, eventData, asClient) => {
  try {
    // Aerospike CDT operation returning the new DataCube
    let campaignKey = new Aerospike.Key(config.namespace, config.campaignSet, campaignId);
    const kvops = Aerospike.operations;
    const maps = Aerospike.maps;
    const ops = [
      kvops.read(config.statsBin),
      maps.increment(config.statsBin, eventData.event, 1),
    ];
    let record = await asClient.operate(campaignKey, ops);
    return record.bins[config.statsBin];
  } catch (err) {
    console.error('accumulateInCampain Error:', err);
  }
};




class EventReceiver {
  constructor(kafkaClient, aerospikeClient) {
    this.kafkaClient = kafkaClient;
    this.aerospikeClient = aerospikeClient;
    this.consumer = new Consumer(kafkaClient,
      [{
        topic: eventTopic,
        partition: 0
      }],
      {
        autoCommit: true,
        fromOffset: false
      }
    );

    let subscriptionPublisher = new SubscriptionEventPublisher(kafkaClient);

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

        const accumulatedData = await accumulateInCampaign(campaignId, eventValue, aerospikeClient);

        // Aerospike CDT operation returning the new DataCube
        let campaignKey = new Aerospike.Key(config.namespace, config.campaignSet, campaignId);
        const kvops = Aerospike.operations;
        const maps = Aerospike.maps;
        const kpiKey = eventValue.event + 's';
        const ops = [
          kvops.read(config.statsBin),
          maps.increment(config.statsBin, kpiKey, 1),
          maps.increment(config.statsBin, `${source}.${kpiKey}`, 1),
        ];
        let record = await aerospikeClient.operate(campaignKey, ops);
        console.log('Campaign KPI processed', campaignId, kpiKey, record.bins.stats);

        // publish kafka for GraphQL subscription
        subscriptionPublisher.publishKPI(campaignId, kpiKey, record.bins.stats)

      } catch (error) {
        console.error(error);
      }
    });

    this.consumer.on('error', function (err) {
      console.error('Error:', err);
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

  publishKPI(campaignId, kpi, value) {
    const subscriptionMessage = {
      campaignId: campaignId,
      kpi: kpi,
      value: value
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