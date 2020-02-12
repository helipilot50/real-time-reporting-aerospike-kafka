const kafka = require('kafka-node');

const Consumer = kafka.Consumer;

const subscriptionTopic = process.env.SUBSCRIPTION_TOPIC;
const kafkaCluster = process.env.KAFKA_CLUSTER;

const topic = {
  topic: subscriptionTopic,
  partition: 0
};

const connectToKafka = () => {
  try {
    let kafkaClient = new kafka.KafkaClient({
      autoConnect: true,
      kafkaHost: kafkaCluster
    });
    console.log('Connected to Kafka', kafkaCluster);
    return kafkaClient;
  } catch (kafkaError) {
    console.error(`Kafka error - retrying in 5 secs`, error);
    setTimeout(connectToKafka, 5000);
  }
};

let connectAttempts = 0;
let connectionRetry = 5000;

const addTopic = function (consumer, topic) {
  connectAttempts += 1;
  consumer.addTopics([topic], function (error, thing) {
    if (error) {
      console.error(`Add topic error - retry in ${connectionRetry / 1000} sec`, error.message);

      if (connectAttempts > 10) connectionRetry = 60000
      setTimeout(
        addTopic,
        connectionRetry, consumer, topic);
    }
  });
};
class KpiEventReceiver {
  constructor(pubsub) {
    let kafkaClient = connectToKafka();
    this.pubsub = pubsub;
    let consumer = new Consumer(
      kafkaClient,
      [],
      {
        autoCommit: true,
        fromOffset: false
      }
    );

    this.consumer = consumer;
    addTopic(this.consumer, topic);

    let offset = new kafka.Offset(kafkaClient);


    this.consumer.on('message', async function (eventMessage) {

      try {
        let payload = JSON.parse(eventMessage.value);
        pubsub.publish('NEW_KPI', payload);
      } catch (error) {
        console.error(error);
      }
    });

    this.consumer.on('error', function (err) {
      console.error('Error:', err);
      if (error.TopicsNotExist) {
        setTimeout(consumer.addTopics({
          topic: subscriptionTopic,
          partition: 0
        }), 5000);
      }
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

module.exports = {
  KpiEventReceiver
}