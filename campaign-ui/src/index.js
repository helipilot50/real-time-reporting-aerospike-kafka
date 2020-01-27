import React from 'react';
import { render } from 'react-dom';
import './index.css';
import App from './App';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from '@apollo/react-hoc';

const campaignServiceUri = process.env.CAMPAIGN_SERVICE || 'localhost:4050';

console.log('service uri', campaignServiceUri);

const client = new ApolloClient({
  uri: `http://${campaignServiceUri}`,
});

const WrappedApp = (
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
);

render(WrappedApp, document.getElementById('root'));

