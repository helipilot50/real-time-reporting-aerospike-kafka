import React from 'react';
import { render } from 'react-dom';
import './index.css';
import App from './App';
import { ApolloClient } from 'apollo-client/index';
import { ApolloProvider } from '@apollo/react-hoc';

import { split } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import { defaultDataIdFromObject, InMemoryCache } from 'apollo-cache-inmemory';

const campaignServiceHost = process.env.CAMPAIGN_SERVICE_HOST || 'localhost';
const campaignServicePort = process.env.CAMPAIGN_SERVICE_PORT || '4050';
const campaignServiceWsPort = process.env.CAMPAIGN_SERVICE_WS_PORT || '4050';

console.log('service uri', campaignServiceHost);

const httpLink = new HttpLink({
  uri: `http://${campaignServiceHost}:${campaignServicePort}`,
});
console.log('httpLink:', httpLink);
const wsLink = new WebSocketLink({
  uri: `ws://${campaignServiceHost}:${campaignServiceWsPort}/`,
  options: {
    reconnect: true,
    lazy: true,
  },
});

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

const cache = new InMemoryCache({
  dataIdFromObject: defaultDataIdFromObject,
});

const client = new ApolloClient({
  link,
  cache
});

const WrappedApp = (
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
);

render(WrappedApp, document.getElementById('root'));

