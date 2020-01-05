const config = require('config');
const kafka = require('kafka-node');
const Aerospike = require('aerospike');
const HighLevelProducer = kafka.HighLevelProducer;
const Consumer = kafka.Consumer;
const eventTopic = process.env.EVENT_TOPIC;
const subscriptionTopic = process.env.SUBSCRIPTION_TOPIC;
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
    this.producer = new HighLevelProducer(kafkaClient);

    consumer.on('message', function (eventMessage) {
      try {
        console.log("Event message", JSON.stringify(eventMessage, null, 2));

        const { campaignId, eventData } = this.decodeMessage(eventMessage);
        const accumulatedData = this.accumulateInCampaign(campaignId, eventData);
        this.publishDataCube(campaignId, accumulatedData);


      } catch (error) {
        console.error(error);
      }
    });

    consumer.on('error', function (err) {
      console.error('Error:', err);
    });


    consumer.on('offsetOutOfRange', function (err) {
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
  async decodeMessage(eventMessage) {

    try {
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
      let tagRecord = this.aerospikeClient.select(tagKey, [config.campaignIdBin]);
      return {
        campaignId: tagRecord.bins[config.campaignIdBin],
        eventData: eventValue
      };
    } catch (err) {
      console.error('decodeMessage Error:', err);
    }
  }
  async accumulateInCampain(campaignId, eventData) {
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

  publishDataCube(campaighId, accumulatedData) {
    const subscriptionMessage = {
      campaighId: campaighId,
      dataCube: accumulatedData
    },
    const producerRequest = {
      topic: subscriptionTopic,
      messages: JSON.stringify(subscriptionMessage),
      timestamp: Date.now()
    };

    this.producer.send(producerRequest, function (err, data) {
      if (err)
        console.error('publishDataCube message error', err);
      else
        console.log(data);
    });
  };

}

module.exports = {
  EventReceiver
}