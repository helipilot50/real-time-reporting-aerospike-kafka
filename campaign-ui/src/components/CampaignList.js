import React from 'react';


import gql from 'graphql-tag';
import { graphql } from '@apollo/react-hoc';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import CampaignRow from './CampaignRow';

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  title: {
    flexGrow: 1,
  },
  table: {
    minWidth: 650,
  },
}));


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

  // console.log('campaigns: ', JSON.stringify(campaigns, null, 2));
  const campaignList = campaigns.map(campaign => {
    return <CampaignRow key={campaign.id} campaign={campaign} />
  });

  return (
    <TableContainer component={Paper}>
      <Table className={classes.table} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Id</TableCell>
            <TableCell>Campaign Name</TableCell>
            <TableCell>Impressions</TableCell>
            <TableCell>Clicks</TableCell>
            <TableCell>Visits</TableCell>
            <TableCell>Conversions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {campaignList}
        </TableBody>
      </Table>
    </TableContainer >
  );

};

export const Campaigns = withCampaigns(CampaignsWithoutData);

