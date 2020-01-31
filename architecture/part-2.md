
# Near real-time Campaign Reporting Part 2 - Aggregation/Reduction

![](https://raw.githubusercontent.com/helipilot50/real-time-reporting-aerospike-kafka/master/architecture/aerospike-logo-long.png)

This is the second in a series of articles describing a simplified example of near real-time Ad Campaign reporting on a fixed set of campaign dimensions usually displayed for analysis in a user interface. The solution presented in this series relies on [Kafka](https://en.wikipedia.org/wiki/Apache_Kafka), [Aerospike’s edge-to-core](https://www.aerospike.com/blog/edge-computing-what-why-and-how-to-best-do/) data pipeline technology, and [Apollo GraphQL](https://www.apollographql.com/)

* [Part 1](part-1.md): real-time capture of Ad events via Aerospike edge datastore and Kafka messaging.

* Part 2: aggregation and reduction of Ad events leveraging Aerospike Complex Data Types (CDTs) for aggregation and reduction of Ad events into actionable Ad Campaign Key Performance Indicators (KPIs).

* [Part 3](part-3.md): describes how an Ad Campaign user interface displays those KPIs using GraphQL retrieve data stored in an Aerospike Cluster.

![Data flow](http://www.plantuml.com/plantuml/proxy?src=https://raw.githubusercontent.com/helipilot50/real-time-reporting-aerospike-kafka/master/architecture/data-flow.puml&fmt=svg)
*Data flow*
### Summary of Part 1
In part 1 of this series, we 
- used an ad event simulator for data creation
- captured that data in the Aerospike “edge” database
- pushed the results to a Kafka cluster via Aerospike’s Kafka Connector

Part 1 is the base used to implement Part 2


## The use case — Part 2

The simplified use case for Part 2 consists of reading Ad events from a Kafka topic, aggregating/reducing the events into KPI values. In this case the KPIs are simple counters, but in the real-world these would be more complex metrics like averages, gauges, histograms, etc. 

The values are stored in a data cube implemented as a Document or Complex Data Type ([CDT](https://www.aerospike.com/docs/guide/cdt.html)) in Aerospike. Aerospike provides fine-grained operations to read or write one or more parts of a [CDT](https://www.aerospike.com/docs/guide/cdt.html) in a single, atomic, database transaction.

The Aerospike record:

| Bin | Type | Example value |
| --- | ---- | ------------- |
| c-id | long | 6 |
| c-date | long | 1579373062016 |
| c-name | string | Acme campaign 6 |
| stats | map | {"visits":6, "impressions":78, "clicks":12, "conversions":3}|



The Core Aerospike cluster is configured to prioritise consistency over availability to ensure that numbers are accurate and consistent for use with payments and billing. Or in others words: **Money**

In addition to aggregating data, the new value of the KPI is sent via another Kafka topic (and possible separate Kafka cluster) to be consumed by the Campaign Service as a GraphQL subscription and providing a live update in the UI. [Part 3](part-3.md) covers the Campaign Service, Campaign UI and GraphQL in detail. 

![Impression sequence](http://www.plantuml.com/plantuml/proxy?src=https://raw.githubusercontent.com/helipilot50/real-time-reporting-aerospike-kafka/master/architecture/event-sequence-part-2.puml&fmt=svg)

*Aggregation/Reduction sequence*

## Companion code

The companion code is in [GitHub](https://github.com/helipilot50/real-time-reporting-aerospike-kafka). The complete solution is in the `master` branch. The code for this article is in the ‘part-2’ branch. 

Javascript and Node.js are used in each service although the same solution is possible in any language.

The solution consists of:

* All of the service and containers in [Part 1](part-1.md).
* Aggregator/Reducer service - Node.js

Docker and Docker Compose simplify the setup to allow you to focus on the Aerospike specific code and configuration.

### What you need for the setup

All the perquisites are described in [Part 1](part-1.md).

### Setup steps

To set up the solution, follow these steps. Because executable images are built by downloading resources, be aware that the time to download and build the software depends on your internet bandwidth and your computer.

Follow the setup steps in [Part 1](part-1.md). Then

**Step 1.** Checkout the `part-2` branch

```bash
$ git checkout part-2
```

**Step 2.** Then run

```bash
$ docker-compose up
```

Once up and running, after the services have stabilised, you will see the output in the console similar to this:

![Sample console output](https://raw.githubusercontent.com/helipilot50/real-time-reporting-aerospike-kafka/master/architecture/kpi-event-output.png)

*Sample console output*

## How do the components interact?

![Component Interaction](http://www.plantuml.com/plantuml/proxy?src=https://raw.githubusercontent.com/helipilot50/real-time-reporting-aerospike-kafka/master/architecture/core-component-detail.puml&fmt=svg)

*Component Interaction*

**Docker Compose** orchestrates the creation of several services in separate containers:

All of the services and containers in [Part 1](part-1.md) with the addition of:

**Aggregator/Reducer** `aggregator-reducer` - A node.js service to consume Ad event messages from the Kafka topic `edge-to-core` and aggregates the single event with the existing data cube. The data cube is a document stored in an Aerospike CDT. A CDT document can be a list, map, geospatial, or nested list-map in any combination. One or more portions of a CDT can be mutated and read in a single atomic operation. See [CDT Sub-Context Evaluation](https://www.aerospike.com/docs/guide/cdt-context.html) 

Here we use a simple map where multiple discrete counters are incremented. In a real-world scenario the datacube would be a complex document denormalized for read optimization.

 
Like the Event Collector and the Publisher Simulator, the Aggregator/Reducer uses the Aerospike Node.js client. On the first build, all the service containers that use Aerospike will download and compile the supporting C library. The `Dockerfile` for each container uses multi-stage builds to minimise the number of times the C library is compiled.

**Kafka Cli** `kafkacli` - Displays the KPI events used by GraphQL in [Part 3](part-3.md)

### How is the solution deployed?

Each container is deployed using `docker-compose` on your local machine.

*Note:* The `aggregator-reducer` container is deployed along with **all** the containers from [Part 1](part-1.md).

![Deployment](http://www.plantuml.com/plantuml/proxy?src=https://raw.githubusercontent.com/helipilot50/real-time-reporting-aerospike-kafka/master/architecture/docker-compose-deployment-part-2.puml&fmt=svg)

*Deployment*

## How does the solution work?

The `aggregator-reducer` is a headless service that reads a message from the Kafka topic `edge-to-core`. The message is the whole Aerospike record written to `edge-aerospikedb` and exported by `edge-exporter`.

The event data is extracted from the message and written to `core-aerospikedb` using multiple CDT operations in one atomic database operation.

![Event processing](http://www.plantuml.com/plantuml/proxy?src=https://raw.githubusercontent.com/helipilot50/real-time-reporting-aerospike-kafka/master/architecture/aggregator-reducer-activity.puml&fmt=svg)

*aggregation flow*

### Connecting to Kafka

To read from a Kafka topic you need a `Consumer` and this is configured to read from one or more topics and partitions. In this example, we are reading message from one topic `edge-to-core` and this topic has only 1 partition.

```Javascript
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
    ...
    });
    
    this.consumer.on('error', function (err) {
      ...
    });


    this.consumer.on('offsetOutOfRange', function (err) {
      ...
    });

```
Note that the `addTopic()` is called after the `Consumer` creation. This function attempts to add a topic to the consumer, if unsuccessful it waits 5 seconds and tries again. Why do this? The `Consumer` will throw an error if the topic is empty and this code overcomes that problem.

```javascript
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
```

### Extract the event data
The payload of the message is a complete Aerospike record serialised as JSON. 

```json
{
  "msg": "write",
  "key": [
    "test",
    "events",
    "AvYAdzrOmm1xwvWZFyGwEvgjwnk=",
    null
  ],
  "gen": 0,
  "exp": 0,
  "lut": 0,
  "bins": [
    {
      "name": "event-id",
      "type": "str",
      "value": "0d33124c-beca-4b4f-a833-8c9646167e8c"
    },
    {
      "name": "event-data",
      "type": "map",
      "value": {
        "geo": [
          52.366521,
          4.894981
        ],
        "tag": "0a3ca7c5-b845-49ed-ab3a-129f9eca23d6",
        "publisher": "e5b08db3-07b5-456b-aaac-1e59f76c4dd6",
        "event": "impression",
        "userAgent": "Mozilla/5.0 (X11; CrOS x86_64 8172.45.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.64 Safari/537.36"
      }
    },
    {
      "name": "event-tag-id",
      "type": "str",
      "value": "0a3ca7c5-b845-49ed-ab3a-129f9eca23d6"
    },
    {
      "name": "event-source",
      "type": "str",
      "value": "e5b08db3-07b5-456b-aaac-1e59f76c4dd6"
    },
    {
      "name": "event-type",
      "type": "str",
      "value": "impression"
    }
  ]
}
```
These items are extracted:

1. Event value
2. Tag id
3. Event source

These values are used in aggregation step.

```javascript
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
```

### Lookup Campaign Id using Tag
The Tag Id is used to locate the matching Campaign. During campaign creation, a mapping between Tags and Campaign is created, this example uses an Aerospike record where the key is the Tag id and the value is the Campaign Id, and in this case, Aerospike is used a Dictionary/Map/Associative Array.

```javascript
//lookup the Tag id in Aerospike to obtain the Campaign id
let tagKey = new Aerospike.Key(config.namespace, config.tagSet, tagId);
let tagRecord = await aerospikeClient.select(tagKey, [config.campaignIdBin]);
// get the campaign id
let campaignId = tagRecord.bins[config.campaignIdBin];
```

### Aggregating the Event 

The Ad event is specific to a Tag and therefore a Campaign. In our model, a Tag is directly related to a Campaign and KPIs are collected at the Campaign level. In the real-world KPIs are more sophisticated and campaigns have many execution plans (line items).

Each event for a KPI increments the value by 1. Our example stores the KPIs in a document structure ([CDT](https://www.aerospike.com/docs/guide/cdt.html)) in a [bin](https://www.aerospike.com/docs/architecture/data-model.html#bins) in the Campaign [record](https://www.aerospike.com/docs/architecture/data-model.html#records). Aerospike provides operations to atomically [access and/or mutate sub-contexts](https://www.aerospike.com/docs/guide/cdt-context.html) of this structure to ensure the operation latency is ~1ms.

In a real-world scenario, events would be aggregated with sophisticated algorithms and patterns such as time-series, time windows, histograms, etc.

Our code simple increments the value KPI value by 1 using the KPI name as the 'path' to the value:

```javascript
const accumulateInCampaign = async (campaignId, eventSource, eventData, asClient) => {
  try {
    // Aerospike CDT operation returning the new DataCube
    let campaignKey = new Aerospike.Key(config.namespace, config.campaignSet, campaignId);
    const kvops = Aerospike.operations;
    const maps = Aerospike.maps;
    const kpiKey = eventData.event + 's';
    const ops = [
      kvops.read(config.statsBin),
      maps.increment(config.statsBin, kpiKey, 1),
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

```

The new KPI value is incremented and the new value is returned. The magic of Aerospike ensures that the operation is Atomic and Consistent across the cluster with a latency of about 1 ms.


### Publishing the new KPI

We could stop here and allow the Campaign UI and Service (Part 3) to poll the Campaign store `core-aerospikedb` to obtain the latest campaign KPIs - this is a typical pattern.

A more advanced approach is to stimulate the UI whenever a value has changed or at a specified frequency. While introducing new technology and challenges, this approach offers a very responsive UI presenting up to the second KPI values to the user.

The `SubScriptionEventPublisher` uses Kafka as Pub-Sub to publish the new KPI value for a specific campaign on the topic `subscription-events`. In Part 3 the `campaign-service` receives this event and publishes it as a [GraphQL Subscription](https://www.apollographql.com/docs/apollo-server/data/subscriptions/)


```javascript
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

```

## Review

[Part 1](part-1.md) of this series describes:
* creating mock Campaign data
* a publisher simulator
* an event receiver
* an edge database   
* an edge exporter

This article (Part 2) describes the aggregation and reduction of Ad events into Campaign KPIs using Kafka as the messaging system and Aerospike as the consistent data store.

[Part 3](part-3.md) describes the Campaign service and Campaign UI to for a user to view the Campaign KPIs in near real-time.


## Disclaimer
This article, the code samples, and the example solution are entirely my own work and not endorsed by Aerospike or Confluent. The code is PoC quality only and it is not production strength, and is available to anyone under the MIT License.


