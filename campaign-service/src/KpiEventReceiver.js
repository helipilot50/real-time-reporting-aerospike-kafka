const kafka = require('kafka-node');

const Consumer = kafka.Consumer;

const subscriptionTopic = process.env.SUBSCRIPTION_TOPIC;
const kafkaCluster = process.env.KAFKA_CLUSTER;

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

class KpiEventReceiver {
  constructor(pubsub) {
    let kafkaClient = connectToKafka();
    this.pubsub = pubsub;
    this.consumer = new Consumer(kafkaClient,
      [{
        topic: subscriptionTopic,
        partition: 0
      }],
      {
        autoCommit: true,
        fromOffset: false
      }
    );


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