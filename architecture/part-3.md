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

In part 2, we then
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

The second use case subscribes to a GraphQL subscription specific to a Campaign and KPI. A subscription message with the new KPI value is sent from the `campaign-service` to the `campaign-ui` when the KPI has changed.

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

Javascript and Node.js is used in each back-end services, although the same solution is possible in any language

The solution consists of:

* All of the service and containers in [Part 1](part-1.md) and [Part 2](part-2.md).
* Campaign service - Node.js and [Apollo GraphQL Server](https://www.apollographql.com/docs/apollo-server/)
* Campaign UI - [React](https://reactjs.org/), [Material UI](https://material-ui.com/) and [Apollo GraphQL Client React](https://www.apollographql.com/docs/react/)

Docker and Docker Compose simplify the setup to allow you to focus on the Aerospike specific code and configuration.

### What you need for the setup

All the perquisites are described in [Part 1](part-1.md)

### Setup steps

To set up the solution, follow these steps. The Docker images are built by downloading resources, be aware that the time to download and build the software depends on your internet bandwidth and your computer.

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

**Step 4.** The UI
Open a browser to this URL:
```
http://localhost:5000/
```
to display the Campaign application

![Web application](https://raw.githubusercontent.com/helipilot50/real-time-reporting-aerospike-kafka/master/architecture/campaign-ui.gif)

*Campaign KPI application*



**Note:** you are now running 12 services on you local machine

## How do the components interact?

![Component Interaction](http://www.plantuml.com/plantuml/proxy?src=https://raw.githubusercontent.com/helipilot50/real-time-reporting-aerospike-kafka/master/architecture/part-3-component.puml&fmt=svg)

*Component Interaction*

**Docker Compose** orchestrates the creation of twelve services in separate containers:

All of the services and containers of [Part 1](part-1.md) and [Part 2](part-2.md) with the addition of:

**Campaign Service** `campaign-service` - A node.js and [Apollo GraphQL Server](https://www.apollographql.com/docs/apollo-server/) service
 
Like the services in [Part 1](part-1) and [Part 2](part-2), the `campaign-service` uses the Aerospike Node.js client. On the first build, all the service containers that use Aerospike will download and compile the supporting C library. 

An as mentioned in [Part 1](part-1) and [Part 2](part-2), the `Dockerfile` for each container uses multi-stage builds to minimises the number of times the C library is compiled.

**Campaign UI** `campaign-ui` - A [React](https://reactjs.org/) and [Material UI](https://material-ui.com/) single-page web application to display Campaign KPIs, it uses the [Apollo Client React](https://www.apollographql.com/docs/react/) GraphQL client.
### How is the solution deployed?

Each container is deployed using `docker-compose` on your local machine.

*Note:* The `campaign-service` and `campaign-ui` containers is deployed along with **all** the containers from [Part 1](part-1.md) and [Part 2](part-2.md).

![Deployment](http://www.plantuml.com/plantuml/proxy?src=https://raw.githubusercontent.com/helipilot50/real-time-reporting-aerospike-kafka/master/architecture/docker-compose-deployment-part-3.puml&fmt=svg)

*Deployment*

## How does the solution work?

### Campaign service

The `campaign-service` is a deliberately simple Apollo Server providing a GraphQL schema and the resolvers for the root operations defined in that schema.

#### index.js

`src/index.js`  contains:
- a GraphQL server
- a schema in Schema Definition Language
- resolvers for the root operations

**Note:** this is an example server only and is not structured for production.

##### Schema definition

The schema defines the types of:
- `Campaign` - Campain meta data
- `CampaignKPI` - the set of KPIs for a Campaign
- `KPI` - an single KPI e.g. `impressions`

Queries of:
- `campaign(id:ID!)` - returning a single Campaign
- `campaigns(ids:[ID!]!)` - returning a set of campaigns matching the Ids passed

and Subscriptions of:
- `kpiUpdate(campaignId:ID!, kpiName:String)` - posts a KPI event when a KPI update occurs matching the `campaignId` and `kpiName`  



```gql
  type Campaign {
    id: ID
    name: String
    aggregateKPIs: CampaignKPI
  }

  type CampaignKPI {
    clicks: Int
    impressions: Int
    visits: Int
    conversions: Int
  }

  type KPI {
    campaignId: ID
    name: String
    value: Int
  }
  
  type Query {
    campaign(id:ID):Campaign
    campaigns(ids: [ID!]!): [Campaign]
  }

  type Subscription {
    kpiUpdate(campaignId:ID!, kpiName:String):KPI
  }
```
*GraphQL schema*

##### Resolvers
Each field in GraphQL can have a resolver function defined to resolve the value of the field.

In this schema we have defined resolvers for:
* Query
 * campaign(...)
 * campaigns(...)
* Subscription
 * kpiUpdate(...)
 
Query resolver function names match the field names of `campaign` and `campaigns` and they delegate to the campaign data source `CampaignDataSource.js`. 

```javascript
  Query: {
    campaign: (_1, args, context, _2) => {
      return context.campaignsDS.fetchCampaign(args.id);
    },

    campaigns: (_1, args, context, _3) => {
      return context.campaignsDS.fetchCampaignsById(args.ids);
    }
  },
```
*Query resolvers*

The single Subscription resolver `kpiUpdate` implements a filter allowing the front end to subscribe to a KPI for a specific campaign and KPI name. 

```javascript
  Subscription: {
    kpiUpdate: {
      subscribe: withFilter(
        (parent, args, context, info) => pubsub.asyncIterator(['NEW_KPI']),
        (payload, variables) => {
          let isFiltered = (variables.campaignId == payload.campaignId.toString() &&
            variables.kpiName == payload.kpi);
          if (isFiltered)
            console.log(`Subscribe: payload ${JSON.stringify(payload)}, variables ${JSON.stringify(variables)}`);
          return isFiltered;
        }),
      resolve: (payload) => {
        let event = {
          campaignId: payload.campaignId,
          name: payload.kpi,
          value: payload.value
        };
        console.log(`kpiUpdate:`, event);
        return event;
      },
    },
  }
```
*Subscription resolver*

It is a surprisingly small amount of code to implement a GraphQl Schema and Server.

#### CampaignDataSource.js
`src/CampaignDataSource.js` is the connector to Aerospike, its job is to read aerospike Campaign records and transform them to the `type` described in the GraphQL schema.

##### Fetching a single record by ID

Fetching a single campaign is implemented using the Aerospike `get` operation. The whole Aerospike record is read using the primary key and transformed into the GraphQL type. (see Transforming a record to a Campaign)  

```javascript
  async fetchCampaign(id) {
    try {
      let client = await asClient();
      let key = new Aerospike.Key(config.namespace, config.campaignSet, parseInt(id));
      let record = await client.get(key);
      return campaignFromRecord(record);
    } catch (err) {
      if (err.code && err.code == 2) {
        throw new ApolloError(`Campaign ${id} not found`);
      } else {
        console.error('Fetch campaign error:', err);
        throw new ApolloError(`Fetch campaign by ID: ${id}`, err);
      }
    }
  }

```

##### Fetching multiple records an array of IDs

To fetch multiple Campaign records we use the Aerospike `batchRead` operation. The `batchRead` operation reads the requested records concurrently, this is very efficient in a multi-node cluster as records are evenly distributed across nodes and each node will do about the same amount of work to locate and return the requested records.


```javascript
  async fetchCampaignsById(campaignIds) {
    try {
      let client = await asClient();
      let keys = campaignIds.map((id) => {
        return {
          key: new Aerospike.Key(config.namespace, config.campaignSet, parseInt(id)),
          read_all_bins: true
        };
      });
      let records = await client.batchRead(keys);
      records = records.filter(n => n.status == 0);
      let campaigns = records.map((element) => {
        return campaignFromRecord(element.record);
      });
      return campaigns;
    } catch (err) {
      console.error(`fetchCampaignsById: ${campaignIds}`, err);
      throw new ApolloError(`fetchCampaignsById: ${campaignIds}`, err);
    }
  }
```



##### Fetching multiple records using a query

This function is not actually used in the solution, but it does illustrate how to use Aerospike's query capability based on a secondary index and filters.

```javascript
  async listCampaigns() {
    try {
      let campaigns = [];

      let client = await asClient();
      let query = client.query(config.namespace, config.campaignSet);

      // filter by campaign date for today -- demo only
      let startDate = new Date();
      startDate.setHours(0);
      startDate.setMinutes(0);
      startDate.setSeconds(0);
      startDate.setMilliseconds(0);
      let endDate = new Date(startDate);
      endDate.setHours(23);
      endDate.setMinutes(59);
      endDate.setSeconds(59);
      endDate.setMilliseconds(999);

      query.where(Aerospike.filter.range(config.campaignDate, startDate.getTime(), endDate.getTime()));

      let stream = query.foreach();

      return new Promise((resolve, reject) => {
        stream.on('data', (record) => {
          let campaign = campaignFromRecord(record);
          campaigns.push(campaign);
        });
        stream.on('error', (error) => {
          console.error('Aerospike select error', error);
          reject(error);
        });
        stream.on('end', () => {
          resolve(campaigns);
        });
      });
    } catch (err) {
      console.error(`List campaigns error:`, err);
      throw new ApolloError(`List campaigns error:`, err);
    }
  }


```

##### Transforming a record to a Campaign

A Campaign record is stored in a set of [Bins](https://www.aerospike.com/docs/architecture/data-model.html#bins), and these need to be transformed to the GraphQL type.

| Aerospike record | GraphQL types |
| ------------ | ---------------- |
|<pre lang="json">  {<br>    "c-id": 10,<br>    "stats": {<br>      "visits": 0,<br>      "impressions": 0,<br>      "clicks": 0,<br>      "conversions": 0<br>    },<br>    "c-name": "Acme campaign 10",<br>    "c-date": 1581683864910<br>  }</pre>| <pre lang="json">  type Campaign {<br>    id: ID<br>    name: String<br>    aggregateKPIs: CampaignKPI<br>  }<br>  type CampaignKPI {<br>    clicks: Int<br>    impressions: Int<br>    visits: Int<br>    conversions: Int<br>  }</pre>|

The function takes the Aerosike record and returns a Campaign type:

```javascript
const campaignFromRecord = (record) => {
  let campaign = {
    id: record.bins[config.campaignIdBin],
    name: record.bins[config.campaignNameBin],
    aggregateKPIs: record.bins[config.statsBin]
  };
  return campaign;
};
```

#### KpiReceiver
The `KpiReceiver` listens to the Kafka topic `subscription-events` and when a message is received, it is published as a GraphQL subscription. Using Kafka as the pubsub technology allows the `campaign-service` to scale without the KPI event being lost.

Most of the work is done in this code:
```javascript
    this.consumer.on('message', async function (eventMessage) {
      try {
        let payload = JSON.parse(eventMessage.value);
        pubsub.publish('NEW_KPI', payload);
      } catch (error) {
        console.error(error);
      }
    });
```
**Note:** `pubsub` (*line 4*) as part of the `apollo-server` npm package and does all the heavy lifting in implementing GraphQL subscriptions. The `pubsub` 
 reference is passed into the constructor:
 
```javascript
 constructor(pubsub) {
    ...
    this.pubsub = pubsub;
    ...
  }
```

### Campaign UI
The `campaign-ui` is a single page web application implemented using [React](https://reactjs.org/), [Material UI](https://material-ui.com/) and [Apollo GraphQL Client React](https://www.apollographql.com/docs/react/).

The application is implemented by composing the Components:
* ApolloProvider
	* App
		* CampaignList
			* CampaignRow
				* Kpi

#### index.js

Setting up a React application to use Apollo GraphQL is quite straight forward by following this [guide](https://www.apollographql.com/docs/react/get-started/).

In our code we will use GraphQL Subscriptions implemented with [websockets](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket) and Apollo provides all the helper classes and functions to achieve this.


First we create a link to our GraphQL server:

```javascript
const httpLink = new HttpLink({
  uri: `http://${campaignServiceHost}:${campaignServicePort}`,
});
```
then we create a web socket link:
```javascript
const wsLink = new WebSocketLink({
  uri: `ws://${campaignServiceHost}:${campaignServiceWsPort}/graphql`,
  options: {
    reconnect: true,
    lazy: true,
  },
});
```
we can optimise the communications paths to the server by splitting the link based on the operation type.
```javascript
const link = split(
  // split based on operation type
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink,
);
```
we also add a client side [cache](https://www.apollographql.com/docs/react/caching/cache-configuration) - not necessary in this example, but fun to add anyway.
```javascript
const cache = new InMemoryCache({
  dataIdFromObject: defaultDataIdFromObject,
});
```
finally we create an [ApolloClient](https://www.apollographql.com/docs/react/api/apollo-client/) instance
```javascript
const client = new ApolloClient({
  link,
  cache
});
```


`ApolloProvider` is a HOC from Apollo that encapsulates the `App` component and passes down the `ApolloClient` instance as a property and is available to child components of `App`.
 
```javascript
const WrappedApp = (
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
);

```
The React App is ready to interact with the `campaign-service`.

#### CampaignList

`CampaignList.js` is a table using Material-UI components. An array of campaign Ids are passed in props. These Ids are use in the GraphQL query:

```javascript
const CAMPAIGN_LIST = gql`
query campaigns($campaignIds: [ID!]!) {
  campaigns(ids: $campaignIds) {
    id
    name
    aggregateKPIs {
      clicks
      impressions
      visits
      conversions
    }
  }
}
`;
```
*Campaign query*

The `render()` method creates a `TableContainer` with a `TableHeader`, each row in the table is `CampaignRow` component.

```javascript
  return (
    <TableContainer component={Paper}>
      <Table className={classes.table} size="small" aria-label="dense table">
        <TableHead>
          <TableRow>
            <TableCell className={classes.kpiColumn} >Id</TableCell>
            <TableCell className={classes.campaignColumn}>Campaign Name</TableCell>
            <TableCell className={classes.kpiColumn} align="right">Impressions</TableCell>
            <TableCell className={classes.kpiColumn} align="right">Clicks</TableCell>
            <TableCell className={classes.kpiColumn} align="right">Visits</TableCell>
            <TableCell className={classes.kpiColumn} align="right">Conversions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {campaignList}
        </TableBody>
      </Table>
    </TableContainer >
  );
```
*render() method*


#### CampaignRow

The `CamaignRow` component receives the "campaign" via props. Each KPI column is implemented using the `Kpi` compinent

```javascript
export default function CampaignRow({ campaign }) {
  return (
    <TableRow key={campaign.id}>
      <TableCell component="th" scope="row">{campaign.id}</TableCell>
      <TableCell align="left" >{campaign.name}</TableCell>
      <TableCell align="right"><Kpi campaignId={campaign.id} kpiName="impressions" initialValue={campaign.aggregateKPIs.impressions} /></TableCell>
      <TableCell align="right"><Kpi campaignId={campaign.id} kpiName="clicks" initialValue={campaign.aggregateKPIs.clicks} /></TableCell>
      <TableCell align="right"><Kpi campaignId={campaign.id} kpiName="visits" initialValue={campaign.aggregateKPIs.visits} /></TableCell>
      <TableCell align="right"><Kpi campaignId={campaign.id} kpiName="conversions" initialValue={campaign.aggregateKPIs.conversions} /></TableCell>
    </TableRow>
  )
}
```
*CampaignRow component*

#### Kpi
The `Kpi` component renders the KPI value and, more interestingly, subscribes to the defigned GraphQL subscription `kpiUpdate`.

```javascript
const KPI_SUBSCRIPTION = gql`
subscription kpiUpdate($campaignId: ID!, $kpiName:String!){
  kpiUpdate(campaignId: $campaignId, kpiName: $kpiName) {
    campaignId
    name
    value
  }
}
`;
```
*GraphQL Subscription*

The component is rendered by including the GraphQL subscription to listen for KPI updates.

```javascript
  render() {
    const { startAttention } = this.state
    const variant = startAttention ? 'H5' : 'inherit';
    const type = startAttention ? 'secondary' : 'inherit';
    return (
      <Typography color={type} variant={variant}>
        <Subscription subscription={KPI_SUBSCRIPTION}
          variables={{ campaignId: this.state.campaignId, kpiName: this.state.kpiName }}
          shouldResubscribe={true} onSubscriptionData={this.attention}>
          {
            ({ data, loading }) => {
              if (data) {
                return (data.kpiUpdate.value);
              }
              return (this.state.initialValue);
            }
          }
        </Subscription >
      </Typography>
    );
  }
```
*render() method*

In order to highlight the change in a KPI value, the new value is turned red for about 1 second.

```javascript
  attention(something) {
    this.setState({ startAttention: true })
    setTimeout(() => this.setState({ startAttention: false }), 1000);
  }
```



## The whole story

???????

![Impression sequence](http://www.plantuml.com/plantuml/proxy?src=https://raw.githubusercontent.com/helipilot50/real-time-reporting-aerospike-kafka/master/architecture/event-sequence.puml&fmt=svg)

??????
![Components](http://www.plantuml.com/plantuml/proxy?src=https://raw.githubusercontent.com/helipilot50/real-time-reporting-aerospike-kafka/master/architecture/complete-component-detail.puml&fmt=svg)


## Disclaimer
This article, the code samples, and the example solution are entirely my own work and not endorsed by Aerospike, Confluent or Apollo. The code is PoC quality only and it is not production strength, and is available to anyone under the MIT License.
