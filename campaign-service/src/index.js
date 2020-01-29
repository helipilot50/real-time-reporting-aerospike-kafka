const { ApolloServer, gql, PubSub, withFilter } = require('apollo-server');
const { CampaignDataSource } = require('./CampaignDataSource');
const { KpiEventReceiver } = require('./KpiEventReceiver');

const pubsub = new PubSub();
const kpiReceiver = new KpiEventReceiver(pubsub);

//
// Schema
//
const typeDefs = gql`
 

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
`;

//
// Resolvers
//
const resolvers = {
  Query: {
    campaign: (_1, args, context, _2) => {
      return context.campaignsDS.fetchCampaign(args.id);
    },

    campaigns: (_1, args, context, _3) => {
      return context.campaignsDS.fetchCampaignsById(args.ids);
    }
  },

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
};

const server = new ApolloServer(
  {
    typeDefs,
    resolvers,
    context: {
      campaignsDS: new CampaignDataSource()
    }
  }
);

server.listen().then(({ url, subscriptionsUrl }) => {
  console.log(`Campaign Server ready at ${url}`);
  console.log(`Subscriptions ready at ${subscriptionsUrl}`);
});
