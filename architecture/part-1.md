
# Near real-time Campaign Reporting Part 1 - Event Collection

![](https://raw.githubusercontent.com/helipilot50/real-time-reporting-aerospike-kafka/master/architecture/aerospike-logo-long.png)

This is the first in a series of articles describing a simplified example of near real-time Ad Campaign reporting on a fixed set of campaign dimensions usually displayed for analysis in a user interface. The solution presented in this series relies on [Kafka](https://en.wikipedia.org/wiki/Apache_Kafka), [Aerospike’s edge-to-core](https://www.aerospike.com/blog/edge-computing-what-why-and-how-to-best-do/) data pipeline technology, and [Apollo GraphQL](https://www.apollographql.com/)

* Part 1: real-time capture of Ad events via Aerospike edge datastore and Kafka messaging.

* Part 2: aggregation and reduction of Ad events via Aerospike Complex Data Type (CDT) operations into actionable Ad Campaign Key Performance Indicators (KPIs).

* Part 3: describes how an Ad Campaign user interface displays those KPIs using GraphQL retrieve data stored in an Aerospike Cluster.

![Data flow](http://www.plantuml.com/plantuml/proxy?src=https://raw.githubusercontent.com/helipilot50/real-time-reporting-aerospike-kafka/master/architecture/data-flow.puml&fmt=svg)
*Data flow*

This article, the code samples, and the example solution are entirely my own work and not endorsed by Aerospike. The code is available to anyone under the MIT License.

## The use case — Part 1

A simplified use case for Part 1 here consists of capturing Ad events from Publishers, Advertisers and Vendors in an Aerospike edge datastore and publishing via Kafka

![Impression sequence](http://www.plantuml.com/plantuml/proxy?src=https://raw.githubusercontent.com/helipilot50/real-time-reporting-aerospike-kafka/master/architecture/event-sequence-part-1.puml&fmt=svg)

*Impression sequence*

## Companion code

The companion code is in [GitHub](https://github.com/helipilot50/real-time-reporting-aerospike-kafka). The complete solution is in the `master` branch. The code for this article is in the ‘part-1’ branch. 

Javascript and Node.js is used in each service although the same solution is possible in any language

The solution consists of:

* A Publisher Simulator — Node.js
* An Event Collector service — Node.js
* Aerospike configurations enabling Kafka
* Docker compose yml
* Docker containers for:
 * Aerospike Enterprise Edition ([https://dockr.ly/2KZ6EUH](https://dockr.ly/2KZ6EUH))
 * Zookeeper ([https://dockr.ly/2KZgaaw](https://dockr.ly/2KZgaaw))
 * Kafka ([https://dockr.ly/2L4NwVA](https://dockr.ly/2L4NwVA))
 * Kafka CLI ([https://dockr.ly/2KXYEn4](https://dockr.ly/2KXYEn4))

Docker and Docker Compose simplify the setup to allow you to focus on the Aerospike specific code and configuration.

### What you need for the setup

* Aerospike Enterprise Edition
* An Aerospike user name and password
* An Aerospike [Feature Key File](https://www.aerospike.com/docs/reference/configuration/index.html?show-removed=1#feature-key-file) from Aerospike Support containing features:
 * sdb-change-notification
 * asdb-strong-consistency
 * mesg-kafka-connector
* Docker and Docker Compose

### Setup steps

To set up the solution, follow these steps. Because executable images are built by downloading resources, be aware that the time to download and build the software depends on your internet bandwidth and your computer.

**Step 1.** Clone the [GitHub](https://github.com/helipilot50/real-time-reporting-aerospike-kafka) repository with one of the following options

* To get the **whole repository** use:

```bash
$ git clone (https://github.com/helipilot50/real-time-reporting-aerospike-kafka
$ cd real-time-reporting-aerospike-kafka
$ git checkout part-1
```
* To get **part-1 only** use:

```bash
$ git clone --single-branch --branch part-1 https://github.com/helipilot50/real-time-reporting-aerospike-kafka
```

**Step 2.** Edit the file docker-compose.yml and add you Aerospike customer user name and password

![](https://raw.githubusercontent.com/helipilot50/real-time-reporting-aerospike-kafka/master/architecture/username-password.png)

**Step 3.** Copy your Feature Key File to project etc directory for the Edge and Core datastore; and to the edge exporter:

```bash
$ cp ~/features.conf <project-root>/aerospike/edge/etc/aerospike/features.conf
$ cp ~/features.conf <project-root>/aerospike/core/etc/aerospike/features.conf
$ cp ~/features.conf <project-root>/edge-exporter/features.conf
```

**Step 4.** Then run

```bash
$ docker-compose up
```

Once up and running, after the services have stabilized, you will see the output in the console similar to this:

![Sample console output](https://raw.githubusercontent.com/helipilot50/real-time-reporting-aerospike-kafka/master/architecture/part-1-console-log.png)

*Sample console output*

## How do the components interact?

![Component Interaction](http://www.plantuml.com/plantuml/proxy?src=https://raw.githubusercontent.com/helipilot50/real-time-reporting-aerospike-kafka/master/architecture/edge-component-detail.puml&fmt=svg)

*Component Interaction*

**Docker Compose** orchestrates the creation of several services in separate containers:

**Zookeeper** `zookeeper` — a single instance of [Zookeeper](https://www.cloudkarafka.com/blog/2018-07-04-cloudkarafka_what_is_zookeeper.html) to maintain the naming and configuration for Kafka (and other things)

**Kafka** `kafka` — a single node [Kafka](https://www.confluent.io/what-is-apache-kafka/?utm_medium=sem&utm_source=google&utm_campaign=ch.sem_br.nonbrand_tp.prs_tgt.kafka_mt.xct_rgn.emea_lng.eng_dv.all&utm_term=what%20is%20kafka&creative=367725579349&device=c&placement=&gclid=Cj0KCQjw4s7qBRCzARIsAImcAxYvKlJV9BeLfEEJDZPHBXFLYxMOOkIDrAHLmKsxdYBQ5r02kt1-zD0aAknIEALw_wcB) cluster

**Kafka CLI** `kafkacli` — Kafka C is used to view the messages in the Kafka topic

**Aerospike Edge** `edge-aerospikedb` — a single node Aerospike Enterprise cluster in [Availability Mode](https://www.aerospike.com/docs/architecture/consistency.html#available-mode). **Availability** is important to ensure every event is captured in real-time. The Dockerfile and other files for the Aerospike Enterprise server is located in the edge-aerospike directory. This container also mounts four volumes at runtime.

![Edge container volume mounts](https://raw.githubusercontent.com/helipilot50/real-time-reporting-aerospike-kafka/master/architecture/edge-volume-mounts.png)

*Edge container volume mounts*

**Aerospike Core** `core-aerospikedb` — a single node Aerospike Enterprise cluster in [Strong Consistency mod](https://www.aerospike.com/docs/architecture/consistency.html#strong-consistency-mode)e. **Consistency** is necessary as Campaign KPIs are used for payment a.k.a they represent money. The Dockerfile and other files for the Aerospike Enterprise server is located in the core-aerospike directory. This container also mounts three volumes at runtime. 

![Core container volume mounts](https://raw.githubusercontent.com/helipilot50/real-time-reporting-aerospike-kafka/master/architecture/core-volume-mounts.png)

*Core container volume mounts*

**Edge Exporter** `edge-exporter` — A single instance of the Aerospike Kafka Connector service. The edge-exporter directory contains the Dockerfile and feature.conf that define the connector service. This container also mounts two volumes at runtime

![Kafka Connector volume mounts](https://raw.githubusercontent.com/helipilot50/real-time-reporting-aerospike-kafka/master/architecture/kafka-volume-mounts.png)

*Kafka Connector volume mounts*

**Data Initializer** `data-initializer` — A node.js program to initialize Campaign data and Tags in the core data store. 

It runs briefly at the start of the docker-compose sequence, checks for data, writes sample data if none exist, and then terminates.

**Publisher Simulator** `publisher-simulator` — A Node.js program that produces random events to simulate the activity of publishers, advertisers and vendors. Each event is decorated with simulated Geo and User-agent data. 

These events are generated with a **completely contrived ratio** and serve as an **example only**. In the real world, most events are impressions, with one click for every thousand impressions and one conversion in fifty clicks. 

The `publisher-simulator` directory contains the simple node source, package.json and the Dockerfile.

**Event Collector** `event-collector` - A node.js REST API service implemented using [Express](https://expressjs.com/). This service is a simple API that receives an Event from a Tag via a POST request and stores the event data in the edge datastore. The `event-collector` directory contains the node source, package.json and the `Dockerfile`.

Both the Event Collector and the Publisher Simulator use the Aerospike Node.js client. On the first build, both containers download and compile the supporting C library. The `Dockerfile` for both containers uses a multi-stage build that minimises the number of times the C library is compiled.

### How is the solution deployed?

Each container is deployed using `docker-compose` on your local machine.

![Deployment](http://www.plantuml.com/plantuml/proxy?src=https://raw.githubusercontent.com/helipilot50/real-time-reporting-aerospike-kafka/master/architecture/docker-compose-deployment.puml&fmt=svg)

*Deployment*

## How does the solution work?

### Connecting to Aerospike

The code to connect to an Aerospike Cluster is similar in each component. You provide one or more address and ports in an array to the `Aerospike.connect()` method.

```js
console.log('Attempting to connect to Aerospike cluster', asHost, asPort);

Aerospike.connect({
  hosts: [
    { addr: asHost, port: asPort }
  ],
  policies: {
    read: new Aerospike.ReadPolicy({
      totalTimeout: 100
    }),
    write: new Aerospike.WritePolicy({
      totalTimeout: 100
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
```
*Connecting to Aerospike*

The Aerospike client iterates through the array of IP addresses and ports until it successfully connects to a node. It then discovers all nodes in the cluster.

### Data initializer

The data initializer creates 100 Campaigns with 1000 Tags per Campaign in the Core datastore. This forms the basic data for the entire simulation. 

![Data model](http://www.plantuml.com/plantuml/proxy?src=https://raw.githubusercontent.com/helipilot50/real-time-reporting-aerospike-kafka/master/architecture/campaign-object-simple.puml&fmt=svg)

*Data model*

Campaigns are created with an Aerospike simpleput operation with [Bins](https://www.aerospike.com/docs/architecture/data-model.html#bins) representing the indexable fields of a Campaign and a Complex Data Type ([CDT](https://www.aerospike.com/docs/guide/cdt.html)) is initialized to form an elementary data cube for KPIs.
```javascript
let campaignId = uuidv4();
// write campaign
let campaignKey = new Aerospike.Key(config.namespace, config.campaignSet, campaignId);
let bins = {};
bins[config.campaignIdBin] = campaignId;
bins[config.statsBin] = {
  clicks: 0,
  impressions: 0,
  visits: 0,
  conversions: 0,
};
bins[config.campaignNameBin] = `Acme campaign ${i}`;
await asClient.put(campaignKey, bins);
console.log('created campaign', bins[config.campaignNameBin]);
```
*Campaign data*

For each Campaign, one thousand Tags are created. A Tag is actually JavaScript tag added to a web page to reference the Creative and provide Ad events. Tags have unique Ids and are related to a Campaign via an Execution Plan. In this example, a Tag record is created with a reference to the Campaign.
```javascript
tag = uuidv4();
// write tag-campaign mapping to aerospike
let tagKey = new Aerospike.Key(config.namespace, config.tagSet, tag);
let tagBins = {};
tagBins[config.tagIdBin] = tag;
tagBins[config.campaignIdBin] = campaignId;
await asClient.put(tagKey, tagBins);
```
*Tag to Campaign mapping*

For the simulator to send events with valid Tags, Aerospike is used as an [associative array](https://en.wikipedia.org/wiki/Associative_array) allowing an index lookup to retrieve a Tag Id, with a simple numeric index referencing the Tag Id.
```javascript
let tagListKey = new Aerospike.Key(config.namespace, config.tagSet, tagIndex);
tagBins = {};
tagBins[config.tagIdBin] = tag;
await asClient.put(tagListKey, tagBins);
```
*Indexing Tags with a numeric key*

### Publisher Simulator

The Publisher Simulator emits an Ad event on a defined interval to simulate the action of people interacting with an Ad. The interval between events deliberately large so we can see the whole sequence.

Every **interval**, the simulator:

* Creates a random event

* Reads a random Tag from the Campaign data stored in Aerospike

* Simulates the Publisher/Advertiser/Vendor id

* Sends the event to the event collector

```javascript
const intervalFunc = async () => {
  try {

    let event = randomEvent();

    let index = Math.floor(Math.random() * 100000);
    let tagKey = new Aerospike.Key(config.namespace, config.tagSet, index);
    let record = await asClient.get(tagKey);
    let tag = record.bins[config.tagIdBin];

    let sourceId = uuidv4();
    let userAgent = randomUserAgent();
    let options = {
      uri: `http://event-collector:${PORT}/event/${event}`,
      headers: {
        'user-agent': userAgent,
      },
      json: {
        event: event,
        tag: tag,
        geo: randomGeo(),
      }
    };

    switch (event) {
      case 'click':
        options.json['publisher'] = sourceId;
        break;
      case 'impression':
        options.json['publisher'] = sourceId;
        break;
      case 'visit':
        options.json['advertiser'] = sourceId;
        break;
      case 'conversion':
        options.json['vendor'] = sourceId;
        break;
    }
    console.log(`Event:`, options)
    request.post(options);
  } catch (error) {
    console.error('send event error', error);
  }
}

setInterval(intervalFunc, INTERVAL);
```
*Creating random event types with a known set of Tags*

This simulator can be scaled up by changing the **interval** and running multiple containers.

### Even collector

The Event Collector is a Web API implemented with [Express](https://expressjs.com/). 

Each event type has a specific route where the user agent is added to the body of the message and the writeEvent() method is called passing the body of the message.
```javascript
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
```
*Web API using Express*


Events are received from the Publisher/Vendor/Advertiser and stored in an Aerospike edge data store. This store acts as high availability and low latency buffer between the event collector and Kafka.

The raw event is classified by assigning some elements of the event to Bins and then stored using a put operation.

```javascript
const writeEvent = async (type, body) => {
  const eventId = uuidv4();
  try {

    ... connecto to Aerospike here exactly once ...

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
    await asClient.put(clickKey, bins);
    console.log(`Processed ${type} event`, eventId);
  } catch (error) {
    console.error(`${type} event processing error`, eventId);
    throw error;
  }
}
```
*Storing events in Aerospike*

### Edge Exporter

The Edge Exporter is the Aerospike outbound Kafka connector running in a container. Each time a record is written to Aerospike it is exported to Kafka based on setting in the aerospike.conf file on each node in the Aerospike cluster.

```
xdr {
	enable-xdr true
	enable-change-notification true
	xdr-digestlog-path /etc/aerospike/digestlog.log1 100G
	xdr-compression-threshold 1000
	xdr-info-port 3004
	datacenter outbound-kafka {
			dc-type http
			http-version v2
			http-url http://edge-exporter:8080/aerospike/kafka/publish
	}
}
```
*aerospike.conf*

To enable Aerospike to export to Kafka, a `features.conf` file is required to be available to both the Aerospike Kafka Connector and the Aerospike Cluster.

```
# generated 2019-07-19 17:15:53

feature-key-version              1
serial-number                    291903886

valid-until-date                 2019-10-18

asdb-change-notification         true
mesg-kafka-connector             true
raf-realtime-analysis-framework  true

----- SIGNATURE ------------------------------------------------
<signature here>
----- END OF SIGNATURE -----------------------------------------
```
*features.conf*

## Scaling the solution

How fast will it be? -This depends on the technology and hardware used.

Ad Event data is captured in real-time in the edge Aerospike cluster. Aerospike scales horizontally by adding nodes to the cluster. In fact, Aerospike’s ability to scale is one of its most powerful features. Likewise, Kafka is also designed to scale easily. Both technologies have extensive documentation and guides on scaling for throughput, latency, availability and capacity.

Aerospike and Kafka go hand-in-glove. Some of the benefits of Aerospike as a front-end to Kafka are as follows:

* Aerospike gives you a high-throughput, low-latency, datastore configurable to prioritise high-availability or strong consistency at a lower TOC with Flash memorySSDs.

* Ad Event data is captured in real-time, so Kafka service needs less capacity than otherwise.

* Ad Events are log-level data stored in Aerospike. These data can thus be used for even more analytics with the [Aerospike Spark Connector](https://www.aerospike.com/docs/connectors/enterprise/spark/) or other analytics tools.

The [Aerospike Kafka Connector](https://www.aerospike.com/docs/connectors/enterprise/kafka/) runs in the Jetty web server, and can be “Dockerized” and scaled like any other microservice.

For microservices in Docker containers, [Kubernetes](https://kubernetes.io/) is my favourite way to orchestrate for production with excellent autoscaling and high availability features and several CI/CD tools integrate directly with it.

Orchestration with Kubernetes and tools like [Drone](https://drone.io/) and [Helm Charts](https://helm.sh/), enables your Developers to focus on development, and your DevOps not to hate the Developers.

## Related Articles

* [Aerospike and Kafka integration](https://medium.com/aerospike-developer-blog/aerospike-and-kafka-integration-outbound-d948553f885e) 

* [Operations on Nested Data Types in Aerospike](https://medium.com/aerospike-developer-blog/operations-on-nested-data-types-in-aerospike-part-i-c17400ffc15b)



