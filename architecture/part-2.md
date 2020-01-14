
# Near real-time Campaign Reporting Part 1 - Event Collection

![](https://raw.githubusercontent.com/helipilot50/real-time-reporting-aerospike-kafka/master/architecture/aerospike-logo-long.png)

This is the second in a series of articles describing a simplified example of near real-time Ad Campaign reporting on a fixed set of campaign dimensions usually displayed for analysis in a user interface. The solution presented in this series relies on [Kafka](https://en.wikipedia.org/wiki/Apache_Kafka), [Aerospike’s edge-to-core](https://www.aerospike.com/blog/edge-computing-what-why-and-how-to-best-do/) data pipeline technology, and [Apollo GraphQL](https://www.apollographql.com/)

* Part 1: real-time capture of Ad events via Aerospike edge datastore and Kafka messaging.

* Part 2: aggregation and reduction of Ad events via Aerospike Complex Data Type (CDT) operations into actionable Ad Campaign Key Performance Indicators (KPIs).

* Part 3: describes how an Ad Campaign user interface displays those KPIs using GraphQL retrieve data stored in an Aerospike Cluster.

![Data flow](http://www.plantuml.com/plantuml/proxy?src=https://raw.githubusercontent.com/helipilot50/real-time-reporting-aerospike-kafka/master/architecture/data-flow.puml&fmt=svg)
*Data flow*

This article, the code samples, and the example solution are entirely my own work and not endorsed by Aerospike. The code is available to anyone under the MIT License.

## The use case — Part 2

A simplified use case for Part 2 consists of reading Ad events from a Kafka topic, aggregating/reducing the events with existing KPI values. In this case the KPIs are simple counters, but in the real-world these would be more complex metrics like averages, gauges, histograms, etc. 

The values are stored in a data cube implemented as a Complex Data Type ([CDT](https://www.aerospike.com/docs/guide/cdt.html)) or document in Aerospike. Aerospike provide fine-grained operations to read or write one or more parts of a document ([CDT](https://www.aerospike.com/docs/guide/cdt.html)) in a single, atomic, database transaction.

The Core Aerospike cluster is configured to prfioritize consistency over availability to ensure that numbers are accurate and consistent for use with payments and billing. Or in others words: **Money**

In addition to aggregating data, the event message is transformed and sent via another Kafka topic (and possible separate Kafka cluster) to be consumed by the Campaign Service as a GraphQL subscription. Part 3 will cover the Campaign Service and GraphQL in detail. 

![Impression sequence](http://www.plantuml.com/plantuml/proxy?src=https://raw.githubusercontent.com/helipilot50/real-time-reporting-aerospike-kafka/master/architecture/event-sequence-part-2.puml&fmt=svg)

*Aggregation/reduction sequence*

## Companion code

The companion code is in [GitHub](https://github.com/helipilot50/real-time-reporting-aerospike-kafka). The complete solution is in the `master` branch. The code for this article is in the ‘part-1’ branch. 

Javascript and Node.js is used in each service although the same solution is possible in any language

The solution consists of:

* All of the service and containers in Part 1.
* Aggregator/Reducer service - Node.js

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

Follow the setup steps in Part 1. Then

**Step 1.** Checkout the `part-2` branch

```bash
$ git checkout part-2
```

**Step 2.** Then run

```bash
$ docker-compose up
```

Once up and running, after the services have stabilized, you will see the output in the console similar to this:

![Sample console output](https://raw.githubusercontent.com/helipilot50/real-time-reporting-aerospike-kafka/master/architecture/XXX.png)

*Sample console output*

## How do the components interact?

![Component Interaction](http://www.plantuml.com/plantuml/proxy?src=https://raw.githubusercontent.com/helipilot50/real-time-reporting-aerospike-kafka/master/architecture/core-component-detail.puml&fmt=svg)

*Component Interaction*

**Docker Compose** orchestrates the creation of several services in separate containers:

 $$$$$$$ See part 1 $$$$$$$$$
 
Like the Event Collector and the Publisher Simulator, the Aggregator/Reducer uses the Aerospike Node.js client. On the first build, all the service containers that use Aerospike will download and compile the supporting C library. The `Dockerfile` for each container uses multi-stage builds to minimises the number of times the C library is compiled.

### How is the solution deployed?

Each container is deployed using `docker-compose` on your local machine.

*Note:* The `aggregator-reducer` container is deployed along with **all** the containers from Part 1.

![Deployment](http://www.plantuml.com/plantuml/proxy?src=https://raw.githubusercontent.com/helipilot50/real-time-reporting-aerospike-kafka/master/architecture/docker-compose-deployment-part-2.puml&fmt=svg)

*Deployment*

## How does the solution work?

$$$ see part 1 $$$

*Data model*

$$$ see part 1 $$$

%%%%%% add stuff here %%%%%%%

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



