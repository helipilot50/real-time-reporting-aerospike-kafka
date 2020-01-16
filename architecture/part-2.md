
# Near real-time Campaign Reporting Part 1 - Event Collection

![](https://raw.githubusercontent.com/helipilot50/real-time-reporting-aerospike-kafka/master/architecture/aerospike-logo-long.png)

This is the second in a series of articles describing a simplified example of near real-time Ad Campaign reporting on a fixed set of campaign dimensions usually displayed for analysis in a user interface. The solution presented in this series relies on [Kafka](https://en.wikipedia.org/wiki/Apache_Kafka), [Aerospike’s edge-to-core](https://www.aerospike.com/blog/edge-computing-what-why-and-how-to-best-do/) data pipeline technology, and [Apollo GraphQL](https://www.apollographql.com/)

* [Part 1](part-1): real-time capture of Ad events via Aerospike edge datastore and Kafka messaging.

* Part 2: aggregation and reduction of Ad events via Aerospike Complex Data Type (CDT) operations into actionable Ad Campaign Key Performance Indicators (KPIs).

* Part 3: describes how an Ad Campaign user interface displays those KPIs using GraphQL retrieve data stored in an Aerospike Cluster.

![Data flow](http://www.plantuml.com/plantuml/proxy?src=https://raw.githubusercontent.com/helipilot50/real-time-reporting-aerospike-kafka/master/architecture/data-flow.puml&fmt=svg)
*Data flow*

This article, the code samples, and the example solution are entirely my own work and not endorsed by Aerospike. The code is PoC quality only and it is not production strength, and is available to anyone under the MIT License.

## The use case — Part 2

A simplified use case for Part 2 consists of reading Ad events from a Kafka topic, aggregating/reducing the events with existing KPI values. In this case the KPIs are simple counters, but in the real-world these would be more complex metrics like averages, gauges, histograms, etc. 

The values are stored in a data cube implemented as a Document or Complex Data Type ([CDT](https://www.aerospike.com/docs/guide/cdt.html)) in Aerospike. Aerospike provide fine-grained operations to read or write one or more parts of a [CDT](https://www.aerospike.com/docs/guide/cdt.html) in a single, atomic, database transaction.

The Core Aerospike cluster is configured to prioritise consistency over availability to ensure that numbers are accurate and consistent for use with payments and billing. Or in others words: **Money**

In addition to aggregating data, the new value of the KPI is sent via another Kafka topic (and possible separate Kafka cluster) to be consumed by the Campaign Service as a GraphQL subscription and providing a live update in the UI. Part 3 will cover the Campaign Service and GraphQL in detail. 

![Impression sequence](http://www.plantuml.com/plantuml/proxy?src=https://raw.githubusercontent.com/helipilot50/real-time-reporting-aerospike-kafka/master/architecture/event-sequence-part-2.puml&fmt=svg)

*Aggregation/Reduction sequence*

## Companion code

The companion code is in [GitHub](https://github.com/helipilot50/real-time-reporting-aerospike-kafka). The complete solution is in the `master` branch. The code for this article is in the ‘part-2’ branch. 

Javascript and Node.js is used in each service although the same solution is possible in any language

The solution consists of:

* All of the service and containers in [Part 1](part-1).
* Aggregator/Reducer service - Node.js

Docker and Docker Compose simplify the setup to allow you to focus on the Aerospike specific code and configuration.

### What you need for the setup

All the perquisites are described in [Part 1](part-1)

### Setup steps

To set up the solution, follow these steps. Because executable images are built by downloading resources, be aware that the time to download and build the software depends on your internet bandwidth and your computer.

Follow the setup steps in [Part 1](part-1). Then

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

All of the services and containers in [Part 1](part-1) with the addition of:

**Aggregator/Reducer** `aggregator-reducer` - A node.js service to consume Ad event messages from the Kafka topic `edge-to-core` and aggregates the single event with the existing data cube. The data cube a is a document stored in an Aerospike CDT and multiple discrete increment the counters in the document in one atomic operation. See [CDT Sub-Context Evaluation](https://www.aerospike.com/docs/guide/cdt-context.html) 
 
Like the Event Collector and the Publisher Simulator, the Aggregator/Reducer uses the Aerospike Node.js client. On the first build, all the service containers that use Aerospike will download and compile the supporting C library. The `Dockerfile` for each container uses multi-stage builds to minimises the number of times the C library is compiled.

**Kafka Cli** `kadkacli` - Displays the KPI events used by GrapgQL in Part 3

### How is the solution deployed?

Each container is deployed using `docker-compose` on your local machine.

*Note:* The `aggregator-reducer` container is deployed along with **all** the containers from [Part 1](part-1).

![Deployment](http://www.plantuml.com/plantuml/proxy?src=https://raw.githubusercontent.com/helipilot50/real-time-reporting-aerospike-kafka/master/architecture/docker-compose-deployment-part-2.puml&fmt=svg)

*Deployment*

## How does the solution work?

The `aggregator-reducer` reads a message from the Kafka topic `edge-to-core`. The message is the whole Aerospike record written to `edge-aerospikedb`.

The event data is extracted from the message and written to `core-aerospikedb` using multiple CDT operations in one atomic database operation.

![Event processing](http://www.plantuml.com/plantuml/proxy?src=https://raw.githubusercontent.com/helipilot50/real-time-reporting-aerospike-kafka/master/architecture/aggregator-reducer-activity.puml&fmt=svg)

*aggregation flow*

$$$ see part 1 $$$

%%%%%% add stuff here %%%%%%%

## Scaling the solution

How fast will it be? - This depends on the technology and hardware used.

Ad Event data is captured in real-time and Campaign KPIs are viewed in "human time" meaning they are viewed on a frequency defined on the whim of the user. Hence the notion of near real-time campaign reporting.

Aerospike scales by adding nodes to the cluster, providing high throughput, low latency and high availability. Likewise, Kafka is also designed to scale easily with a cluster with no single points-of-failure. Both technologies have extensive documentation and guides on scaling for throughput, latency, availability and capacity. Aerospike and Kafka go hand-in-glove.

Microservices in Docker containers use [Kubernetes](https://kubernetes.io/) to orchestrate for production with excellent **autoscaling** and **high availability** features and several CI/CD tools integrate directly with it.



