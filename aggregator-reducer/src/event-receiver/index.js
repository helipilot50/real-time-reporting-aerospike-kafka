const config = require('config');
const kafka = require('kafka-node');
const Aerospike = require('aerospike');
const HighLevelProducer = kafka.HighLevelProducer;
const Consumer = kafka.Consumer;
const eventTopic = process.env.EVENT_TOPIC;
const subscriptionTopic = process.env.SUBSCRIPTION_TOPIC;



const decodeMessage = async (eventMessage, asClient) => {

  try {

  } catch (err) {
    console.error('decodeMessage Error:', err);
  }
}
const accumulateInCampaign = async (campaignId, eventData, asClient) => {
  try {
    // Aerospike CDT operation returning the new DataCube
    let campaignKey = new Aerospike.Key(config.namespace, config.campaignSet, campaignId);
    const kvops = Aerospike.operations;
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

    this.subscriptionPublisher = new SubscriptionEventPublisher(kafkaClient);


    this.consumer.on('message', async function (eventMessage) {
      try {
        console.log("Event message", JSON.stringify(eventMessage, null, 2));
        // Morph the array of bins to and object
        let bins = eventMessage.bins.reduce(
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
        // lookup the Tag id in Aerospike to obtain the Campaign id
        let tagKey = new Aerospike.Key(config.namespace, config.tagSet, tagId);
        let tagRecord = asClient.select(tagKey, [config.campaignIdBin]);
        // get the campaign id
        let campaignId = tagRecord.bins[config.campaignIdBin],

        const accumulatedData = await this.accumulateInCampaign(campaignId, eventData);

        // Aerospike CDT operation returning the new DataCube
        let campaignKey = new Aerospike.Key(config.namespace, config.campaignSet, campaignId);
        const kvops = Aerospike.operations;
        const ops = [
          kvops.read(config.statsBin),
          maps.increment(config.statsBin, eventData.event, 1),
        ];
        let record = await asClient.operate(campaignKey, ops);

        this.publishDataCube(campaignId, accumulatedData);


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
  }

  publishKPI(campaighId, kpi, value) {
    const subscriptionMessage = {
      campaighId: campaighId,
      kpi: kpi,
      value: value
    };
    const producerRequest = {
      topic: subscriptionTopic,
      messages: JSON.stringify(subscriptionMessage),
      timestamp: Date.now()
    };

    this.producer.send(producerRequest, function (err, data) {
      if (err)
        console.error('publishKPI error', err);
      else
        console.log(data);
    });
  };
}

module.exports = {
  EventReceiver,
  SubscriptionEventPublisher
}