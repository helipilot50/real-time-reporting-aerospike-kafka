# Near real-time Campaign Reporting Part 3 - Campaign Service and Campaign UI


WORK IN PROGRESS


![](https://raw.githubusercontent.com/helipilot50/real-time-reporting-aerospike-kafka/master/architecture/aerospike-logo-long.png)

This is the second in a series of articles describing a simplified example of near real-time Ad Campaign reporting on a fixed set of campaign dimensions usually displayed for analysis in a user interface. The solution presented in this series relies on [Kafka](https://en.wikipedia.org/wiki/Apache_Kafka), [Aerospike’s edge-to-core](https://www.aerospike.com/blog/edge-computing-what-why-and-how-to-best-do/) data pipeline technology, and [Apollo GraphQL](https://www.apollographql.com/)

* [Part 1](part-1.md): real-time capture of Ad events via Aerospike edge datastore and Kafka messaging.

* [Part 2](part-2.md): aggregation and reduction of Ad events via Aerospike Complex Data Type (CDT) operations into actionable Ad Campaign Key Performance Indicators (KPIs).

* Part 3: describes how an Ad Campaign user interface displays those KPIs using GraphQL retrieve data stored in an Aerospike Cluster.

![Data flow](http://www.plantuml.com/plantuml/proxy?src=https://raw.githubusercontent.com/helipilot50/real-time-reporting-aerospike-kafka/master/architecture/data-flow.puml&fmt=svg)
*Data flow*

### Summary of Part 1 and Part 2
In part 1, we
- used an ad event simulator for data creation
- captured that data in the Aerospike “edge” database
- pushed the results to a Kafka cluster via Aerospike’s Kafka Connector

In part 2, we 
- consumed events from Kafka exported via Aerospike’s Kafka Connector
- aggregated each event into Campaign KPIs on arrival
- published a message in Kafka containing the new KPI value


Parts 1 and 2 form the base for Part 3


## The use case — Part 3

The use case for Part 3 has two use cases:

1. displaying Campaign details in a UI 
2. updating Campaign KPIs in real-time 

As mentioned in [Part 2](part-2), the KPIs in this example are very simple counters, but the same techniques could be applied to more sophisticated measurements such as histograms, moving averages, trends.

The first use case reads the Campaign details, including the KPIs from Aerospike record.

The second use case subscribes to a GraphQL subscription specific to a Campaign and KPI. A subscription message is sent from the `campaign-service` to the `campaign-ui` when the KPI has changed.

To recap - the Aerospike record looks like this:

| Bin | Type | Example value |
| --- | ---- | ------------- |
| c-id | long | 6 |
| c-date | long | 1579373062016 |
| c-name | string | Acme campaign 6 |
| stats | map | {"visits":6, "impressions":78, "clicks":12, "conversions":3}|

The Core Aerospike cluster is configured to prioritise consistency over availability to ensure that numbers are accurate and consistent. 

This sequence diagram shows the use cases:

- On page load
- KPI update

![Impression sequence](http://www.plantuml.com/plantuml/proxy?src=https://raw.githubusercontent.com/helipilot50/real-time-reporting-aerospike-kafka/master/architecture/event-sequence-part-3.puml&fmt=svg)
*Campaign Service and UI scenarios*

## Companion code

The companion code is in [GitHub](https://github.com/helipilot50/real-time-reporting-aerospike-kafka). The complete solution is in the `master` branch. The code for this article is in the ‘part-3’ branch. 

Javascript and Node.js is used in each back-end service although the same solution is possible in any language

The solution consists of:

* All of the service and containers in [Part 1](part-1.md) and [Part 2](part-2.md).
* Campaign service - Node.js and [Apollo GraphQL Server](https://www.apollographql.com/docs/apollo-server/)
* Campaign UI - [React](https://reactjs.org/), [Material UI](https://material-ui.com/) and [Apollo GraphQL Client React](https://www.apollographql.com/docs/react/)

Docker and Docker Compose simplify the setup to allow you to focus on the Aerospike specific code and configuration.

### What you need for the setup

All the perquisites are described in [Part 1](part-1.md)

### Setup steps

To set up the solution, follow these steps. Because executable images are built by downloading resources, be aware that the time to download and build the software depends on your internet bandwidth and your computer.

Follow the setup steps in [Part 1](part-1.md). Then

**Step 1.** Checkout the `part-3` branch

```bash
$ git checkout part-3
```

**Step 2.** Then run 
This step deletes the Aerospike data and the Kafka topics data.

```bash
$ ./delete-data.sh 
```
**Step 3.** Finally run

```bash
$ docker-compose up -d
$ docker-compose logs -f publisher-simulator
```

Once up and running, after the services have stabilised, you will see the output in the console similar to this:

![Sample console output](https://raw.githubusercontent.com/helipilot50/real-time-reporting-aerospike-kafka/master/architecture/part-3-console-log.png)

*Sample console output*

## How do the components interact?

![Component Interaction](http://www.plantuml.com/plantuml/proxy?src=https://raw.githubusercontent.com/helipilot50/real-time-reporting-aerospike-kafka/master/architecture/part-3-component.puml&fmt=svg)

*Component Interaction*

**Docker Compose** orchestrates the creation of several services in separate containers:

All of the services and containers of [Part 1](part-1.md) and [Part 2](part-2.md) with the addition of:

**Campaign Service** `campaign-service` - A node.js [Apollo Server](https://www.apollographql.com/docs/apollo-server/) GraphQL service
 
Like the other Node services, the `campaign-service` uses the Aerospike Node.js client. On the first build, all the service containers that use Aerospike will download and compile the supporting C library. The `Dockerfile` for each container uses multi-stage builds to minimises the number of times the C library is compiled.

**Campaign UI** `campaign-ui` - A [React](https://material-ui.com/) and [Material UI]() single-page web application to display Campaign KPIs, it uses the [Apollo Client React](https://www.apollographql.com/docs/react/) GraphQL client.
### How is the solution deployed?

Each container is deployed using `docker-compose` on your local machine.

*Note:* The `campaign-service` and `campaign-ui` containers is deployed along with **all** the containers from [Part 1](part-1.md) and [Part 2](part-2.md).

![Deployment](http://www.plantuml.com/plantuml/proxy?src=https://raw.githubusercontent.com/helipilot50/real-time-reporting-aerospike-kafka/master/architecture/docker-compose-deployment-part-3.puml&fmt=svg)

*Deployment*

## How does the solution work?

### Campaign service


### Campaign UI



## The whole story

![Impression sequence](http://www.plantuml.com/plantuml/proxy?src=https://raw.githubusercontent.com/helipilot50/real-time-reporting-aerospike-kafka/master/architecture/event-sequence.puml&fmt=svg)

## Disclaimer
This article, the code samples, and the example solution are entirely my own work and not endorsed by Aerospike or Confluent. The code is PoC quality only and it is not production strength, and is available to anyone under the MIT License.
