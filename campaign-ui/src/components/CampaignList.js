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
import Typography from '@material-ui/core/Typography';

import { Kpi } from './Kpi';

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  title: {
    flexGrow: 1,
  },
  table: {
    minWidth: 150,
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
  return (

    <TableRow>
      <TableCell component="th" scope="campaign">{campaigns[0].id}</TableCell>
      <TableCell>{campaigns[0].name}</TableCell>
      <TableCell><Kpi campaignId={campaigns[0].id} kpiName="impressions" initialValue={campaigns[0].aggregateKPIs.impressions} /></TableCell>
      <TableCell><Kpi campaignId={campaigns[0].id} kpiName="clicks" initialValue={campaigns[0].aggregateKPIs.clicks} /></TableCell>
      <TableCell><Kpi campaignId={campaigns[0].id} kpiName="visits" initialValue={campaigns[0].aggregateKPIs.visits} /></TableCell>
      <TableCell><Kpi campaignId={campaigns[0].id} kpiName="conversions" initialValue={campaigns[0].aggregateKPIs.conversions} /></TableCell>
    </TableRow>
  );
  // return (
  //   <TableContainer >
  //     <Table className={classes.table} aria-label="simple table">
  //       <TableHead>
  //         <TableRow>
  //           <TableCell>Id</TableCell>
  //           <TableCell>Name</TableCell>
  //           <TableCell>Impressions</TableCell>
  //           <TableCell>Clicks</TableCell>
  //           <TableCell>Visits</TableCell>
  //           <TableCell>Conversions</TableCell>
  //         </TableRow>
  //       </TableHead>
  //       <TableBody>
  //         {campaigns && campaigns.map(campaign => (
  //           <TableRow key={campaign.id}>
  //             <TableCell component="th" scope="campaign">
  //               {campaign.id}
  //             </TableCell>
  //             <TableCell>{campaign.name}</TableCell>
  //             <TableCell>
  //               <Kpi campaignId={campaign.id} kpiName="Impressions" initialValue={campaign.aggregateKPIs.impressions} />
  //             </TableCell>
  //             <TableCell>
  //               <Kpi campaignId={campaign.id} kpiName="Clicks" initialValue={campaign.aggregateKPIs.clicks} />
  //             </TableCell>
  //             <TableCell><Kpi campaignId={campaign.id} kpiName="Visits" initialValue={campaign.aggregateKPIs.visits} />
  //             </TableCell>
  //             <TableCell><Kpi campaignId={campaign.id} kpiName="Conversions" initialValue={campaign.aggregateKPIs.conversions} />
  //             </TableCell>
  //           </TableRow>
  //         ))}
  //       </TableBody>
  //     </Table>
  //   </TableContainer >
  // );
};

export const Campaigns = withCampaigns(CampaignsWithoutData);
