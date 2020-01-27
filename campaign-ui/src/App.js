import React from 'react';
import gql from 'graphql-tag';
import { graphql } from '@apollo/react-hoc';
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
import Button from '@material-ui/core/Button';

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  table: {
    minWidth: 150,
  },
}));

const campaignIds = ["6", "9", "56", "60", "45", "52"];

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

export const withCampaigns = graphql(CAMPAIGN_LIST, {
  options: ({ campaignIds }) => ({
    variables: { campaignIds }
  }),
  props: ({ data }) => ({ ...data })
});

export const CampaignsWithoutData = ({ loading, campaigns, error }) => {
  const classes = useStyles();
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :( {error}</p>;
  return (
    <TableContainer component={Paper}>
      <Table className={classes.table} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Id</TableCell>
            <TableCell align="left">Name</TableCell>
            <TableCell align="center">Impressions</TableCell>
            <TableCell align="center">Clicks</TableCell>
            <TableCell align="center">Visits</TableCell>
            <TableCell align="center">Conversions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {campaigns && campaigns.map(campaign => (
            <TableRow key={campaign.id}>
              <TableCell component="th" scope="campaign">
                {campaign.id}
              </TableCell>
              <TableCell align="left">{campaign.name}</TableCell>
              <TableCell align="center">{campaign.aggregateKPIs.impressions}</TableCell>
              <TableCell align="center">{campaign.aggregateKPIs.clicks}</TableCell>
              <TableCell align="center">{campaign.aggregateKPIs.visits}</TableCell>
              <TableCell align="center">{campaign.aggregateKPIs.conversions}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export const Campaigns = withCampaigns(CampaignsWithoutData);

export const CampaignAppBar = () => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar variant="regular">
          <Typography variant="h6" color="inherit">
            Campaign KPIs - Example
          </Typography>
          {/* <Button color="inherit">Refresh</Button> */}
        </Toolbar>
      </AppBar>
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <CampaignAppBar />
      <Campaigns campaignIds={campaignIds} />
    </div>
  );
}

export default App;
