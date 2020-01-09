const { ApolloServer, gql, PubSub } = require('apollo-server');
const { CampaignDataSource } = require('./CampaignDataSource');

const pubsub = new PubSub();

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
    name: String
    value: Int
  }
  
  type Query {
    campaign(id:ID):Campaign
    campaigns: [Campaign]
  }

  type Subscription {
    kpiUpdate(campaignId:ID, kpiPath:String):KPI
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
    kpiUpdate: (campaignId, kpiPath) => {
      // pubsub.asyncIterator([POST_ADDED]);
    }
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
