# Near real-time Campaign reporting
How to acheive new real-time campaign reporting using [Aerospike](www.aerospike.com) and [Kafka](https://kafka.apache.org/)
Read the full article at [Medium](https://link.medium.com/)

![Component Diagram](http://www.plantuml.com/plantuml/proxy?src=https://raw.githubusercontent.com/helipilot50/real-time-reporting-aerospike-kafka/master/architecture/complete-component-detail.puml&fmt=svg)

Javascript and Node.js is used in each service although the same solution is possible in any language

The solution consists of:
* A Publisher Simulator - Node.js
* An Event Collector service - Node.js
* An Aggregator/Reducer servic - Node.js
* A Campaign Service - Node.js
* A Campaign UI - React and Material UI
* Aerospike configurations enabling Kafka
* Docker compose yml
* Docker containers for:
  * Aerospike Enterprise Edition (https://dockr.ly/2KZ6EUH)
  * Zookeeper (https://dockr.ly/2KZgaaw)
  * Kafka (https://dockr.ly/2L4NwVA)
  * Kafka CLI (https://dockr.ly/2KXYEn4)


# Companion Code
This example uses Docker and Docker Compose to create a simple solution for near real-time Ad Campaign reporting on a fixed set of campaign dimensions. The solution presented in this series relies on Kafka, Aerospike's edge-to-core data pipeline technology, and Apollo GraphQL

The code and the example solution are entirely my own work and not endorsed by Aerospike. The code is PoC quality only and it is not production strength, and is available to anyone under the MIT License.

## Setup

Clone the GitHub repository with 
```bash
$ git clone https://github.com/helipilot50/real-time-reporting-aerospike-kafka 
$ cd real-time-reporting-aerospike-kafka
```
Edit the file docker-compose.yml and add you Aerospike customer user name and password
```yml
  edge-exporter:
    container_name: edge_exporter
    build:
      context: ./edge-exporter
      args:
        AEROSPIKE_USER_NAME: "<your user name>"
        AEROSPIKE_PASSWORD: "<your password>"
```
Copy your Feature Key File to project etc directory for the Edge and Core datastore; and to the edge exporter
```bash
$ cp ~/features.conf <project-root>/aerospike/edge/etc/aerospike/features.conf
$ cp ~/features.conf <project-root>/aerospike/core/etc/aerospike/features.conf
$ cp ~/features.conf <project-root>/edge-exporter/features.conf
```
Then run
```bash
$ docker-compose up
```

### Disclaimer
These code samples and the proposed solution are entirely my own work and not endorsed by Aerospike. The code is available to anyone under the MIT License.
