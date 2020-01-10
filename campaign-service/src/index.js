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
    campaigns: [Campaign]
  }

  type Subscription {
    kpiUpdate(campaignIds:[ID!]!):KPI
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

    campaigns: (_1, _2, context, _3) => {
      return context.campaignsDS.listCampaigns();
    }
  },

  Subscription: {
    kpiUpdate: {
      subscribe: withFilter(
        (parent, args, context, info) => pubsub.asyncIterator(['NEW_KPI']),
        (payload, variables) => {
          // console.log(`pay ${JSON.stringify(payload)}, var ${JSON.stringify(variables)}`);
          return variables.campaignIds.includes(payload.campaignId.toString());
        }),
      resolve: (payload) => {
        return {
          campaignId: payload.campaignId,
          name: payload.kpi,
          value: payload.value
        };
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

server.listen().then(({ url }) => {
  console.log(`Campaign Server ready at ${url}`);
});
