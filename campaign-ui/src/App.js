import React from 'react';
import { ApolloClient } from 'apollo-client';
import { InMemoryCache, NormalizedCacheObject } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import { gql } from 'apollo-boost';
import { ApolloProvider, useQuery } from '@apollo/react-hooks';
// import { gql } from "apollo-boost";
import { SubScription } from "react-apollo";
import './App.css';

import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

const campaignServiceUri = process.env.CAMPAIGN_SERVICE;


const useStyles = makeStyles({
  root: {
    flexGrow: 1,
  },
  table: {
    minWidth: 650,
  },
});

const cache = new InMemoryCache();
const link = new HttpLink({
  uri: campaignServiceUri,
});

const client = new ApolloClient({
  cache,
  link
});

// const client = new ApolloClient({
//   uri: campaignServiceUri,
// });

// const subscribeKpi = gql`
// `;

// function Kpi(campaignId, kpiName, kpiValue) {
//   return (
//     <TableCell align="right">{kpiValue}</TableCell>
//   );
// }

const CAMPAIGN_DETAIL = gql`
  {
    campaigns(ids: ["6", "9", "56", "60", "45", "52"]) {
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
  const classes = useStyles();
  const { loading, error, data } = useQuery(CAMPAIGN_DETAIL);
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :( {error}</p>;
  console.log(data);
  return (
    <TableContainer component={Paper}>
      <Table className={classes.table} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Id</TableCell>
            <TableCell align="right">Name</TableCell>
            <TableCell align="right">Impressions</TableCell>
            <TableCell align="right">Clicks</TableCell>
            <TableCell align="right">Visits</TableCell>
            <TableCell align="right">Conversions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.campaigns.map(campaign => (
            <TableRow key={campaign.id}>
              <TableCell component="th" scope="campaign">
                {campaign.id}
              </TableCell>
              <TableCell align="right">{campaign.name}</TableCell>
              <TableCell align="right">{campaign.aggregateKPIs.impressions}</TableCell>
              <TableCell align="right">{campaign.aggregateKPIs.clicks}</TableCell>
              <TableCell align="right">{campaign.aggregateKPIs.visits}</TableCell>
              <TableCell align="right">{campaign.aggregateKPIs.conversions}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

function CampaignAppBar() {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar variant="dense">
          <Typography variant="h6" color="inherit">
            Campaigns
          </Typography>
        </Toolbar>
      </AppBar>
    </div>
  );
};

function App() {
  return (
    <ApolloProvider client={client}>
      <div className="App">
        <CampaignAppBar />
        <CampaignSet />
      </div>
    </ApolloProvider >
  );
}

export default App;
