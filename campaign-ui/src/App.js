import React from 'react';
import ApolloClient from 'apollo-boost';
import { ApolloProvider, useQuery } from '@apollo/react-hooks';
import { gql } from "apollo-boost";
import logo from './logo.svg';
import './App.css';


const client = new ApolloClient({
  uri: 'http://localhost:4050',
});


const CAMPAIGN_DETAIL = gql`
  {
    campaigns(ids: ["67", "91", "56", "60", "45"]) {
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


function CampaignSet() {
  const { loading, error, data } = useQuery(CAMPAIGN_DETAIL);
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :( {error}</p>;
  console.log(data);
  return data.campaigns.map((campaign) => (
    <div key={campaign.id}>
      <p>
        id: {campaign.id}
      </p>
      <p>
        name: {campaign.name}
      </p>
    </div>
  ));
}

function App() {
  return (
    <ApolloProvider client={client}>
      <div className="App">
        <h2>Campaign Application</h2>
        <CampaignSet />
      </div>
    </ApolloProvider >
  );
}

export default App;
