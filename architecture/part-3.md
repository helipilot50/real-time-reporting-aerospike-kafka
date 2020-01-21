# Near real-time Campaign Reporting Part 3 - Campaign Service and Campaign UI


WORK IN PROGRESS


![](https://raw.githubusercontent.com/helipilot50/real-time-reporting-aerospike-kafka/master/architecture/aerospike-logo-long.png)

This is the second in a series of articles describing a simplified example of near real-time Ad Campaign reporting on a fixed set of campaign dimensions usually displayed for analysis in a user interface. The solution presented in this series relies on [Kafka](https://en.wikipedia.org/wiki/Apache_Kafka), [Aerospike’s edge-to-core](https://www.aerospike.com/blog/edge-computing-what-why-and-how-to-best-do/) data pipeline technology, and [Apollo GraphQL](https://www.apollographql.com/)

* [Part 1](part-1.md): real-time capture of Ad events via Aerospike edge datastore and Kafka messaging.

* [Part 2](part-2.md): aggregation and reduction of Ad events via Aerospike Complex Data Type (CDT) operations into actionable Ad Campaign Key Performance Indicators (KPIs).

* Part 3: describes how an Ad Campaign user interface displays those KPIs using GraphQL retrieve data stored in an Aerospike Cluster.

![Data flow](http://www.plantuml.com/plantuml/proxy?src=https://raw.githubusercontent.com/helipilot50/real-time-reporting-aerospike-kafka/master/architecture/data-flow.puml&fmt=svg)
*Data flow*

This article, the code samples, and the example solution are entirely my own work and not endorsed by Aerospike. The code is PoC quality only and it is not production strength, and is available to anyone under the MIT License.

## The use case — Part 2

?????????????????????

![Impression sequence](http://www.plantuml.com/plantuml/proxy?src=https://raw.githubusercontent.com/helipilot50/real-time-reporting-aerospike-kafka/master/architecture/event-sequence-part-3.puml&fmt=svg)

## Companion code

The companion code is in [GitHub](https://github.com/helipilot50/real-time-reporting-aerospike-kafka). The complete solution is in the `master` branch. The code for this article is in the ‘part-3’ branch. 

Javascript and Node.js is used in each back-end service although the same solution is possible in any language

The solution consists of:

* All of the service and containers in [Part 1](part-1.md) and [Part 2](part-2.md).
* Campaign service - Node.js and [Apollo Server](https://www.apollographql.com/docs/apollo-server/)
* Campaign UI - [React](https://reactjs.org/) and [Material UI](https://material-ui.com/)

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

```bash
$ docker-compose up
```

Once up and running, after the services have stabilised, you will see the output in the console similar to this:

![Sample console output](https://raw.githubusercontent.com/helipilot50/real-time-reporting-aerospike-kafka/master/architecture/???.png)

*Sample console output*

## How do the components interact?

![Component Interaction](http://www.plantuml.com/plantuml/proxy?src=https://raw.githubusercontent.com/helipilot50/real-time-reporting-aerospike-kafka/master/architecture/campaign-service-detail.puml&fmt=svg)

*Component Interaction*

**Docker Compose** orchestrates the creation of several services in separate containers:

All of the services and containers of [Part 1](part-1.md) and [Part 2](part-2.md) with the addition of:

**Campaign Service** `campaign-service` - A node.js service to 
 
Like the other Node services, the `campaign-service` uses the Aerospike Node.js client. On the first build, all the service containers that use Aerospike will download and compile the supporting C library. The `Dockerfile` for each container uses multi-stage builds to minimises the number of times the C library is compiled.

**Campaign UI** `campaign-service` - A React and Material UI single-page web application to display Campaign KPIs 

### How is the solution deployed?

Each container is deployed using `docker-compose` on your local machine.

*Note:* The `campaign-service` and `campaign-ui` containers is deployed along with **all** the containers from [Part 1](part-1.md) and [Part 2](part-2.md).

![Deployment](http://www.plantuml.com/plantuml/proxy?src=https://raw.githubusercontent.com/helipilot50/real-time-reporting-aerospike-kafka/master/architecture/docker-compose-deployment-part-3.puml&fmt=svg)

*Deployment*

## How does the solution work?


???????????


## The whole story

![Impression sequence](http://www.plantuml.com/plantuml/proxy?src=https://raw.githubusercontent.com/helipilot50/real-time-reporting-aerospike-kafka/master/architecture/event-sequence.puml&fmt=svg)
