import React from 'react';
import gql from 'graphql-tag';
import { graphql } from '@apollo/react-hoc';

import Link from '@material-ui/core/Link';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Title from './Title';

import CampaignRow from './CampaignRow';

// Generate Order Data
function createData(id, date, name, shipTo, paymentMethod, amount) {
  return { id, date, name, shipTo, paymentMethod, amount };
}

const rows = [
  createData(0, '16 Mar, 2019', 'Elvis Presley', 'Tupelo, MS', 'VISA ⠀•••• 3719', 312.44),
  createData(1, '16 Mar, 2019', 'Paul McCartney', 'London, UK', 'VISA ⠀•••• 2574', 866.99),
  createData(2, '16 Mar, 2019', 'Tom Scholz', 'Boston, MA', 'MC ⠀•••• 1253', 100.81),
  createData(3, '16 Mar, 2019', 'Michael Jackson', 'Gary, IN', 'AMEX ⠀•••• 2000', 654.39),
  createData(4, '15 Mar, 2019', 'Bruce Springsteen', 'Long Branch, NJ', 'VISA ⠀•••• 5919', 212.79),
];

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

function preventDefault(event) {
  event.preventDefault();
}

const useStyles = makeStyles(theme => ({
  seeMore: {
    marginTop: theme.spacing(3),
  },
}));

export const withCampaigns = graphql(CAMPAIGN_LIST, {
  options: ({ campaignIds }) => ({
    variables: { campaignIds }
  }),
  props: ({ data }) => ({ ...data })
});

export const Campaigns = withCampaigns(CampaignsWithoutData);

export function CampaignsWithoutData({ loading, campaigns, error }) {
  const classes = useStyles();
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :( {error}</p>;

  const campaignList = campaigns.map(campaign => {
    return <CampaignRow key={campaign.id} campaign={campaign} />
  });

  console.log('Campaigns:', campaignList);

  return (
    <React.Fragment>
      <Title>Campaigns</Title>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Id</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Impressions</TableCell>
            <TableCell>Clicks</TableCell>
            <TableCell align="right">Visits</TableCell>
            <TableCell align="right">Conversions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {campaignList}
          {/* {rows.map(row => (
            <TableRow key={row.id}>
              <TableCell>{row.date}</TableCell>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.shipTo}</TableCell>
              <TableCell>{row.paymentMethod}</TableCell>
              <TableCell align="right">{row.amount}</TableCell>
            </TableRow>
          ))} */}
        </TableBody>
      </Table>
      <div className={classes.seeMore}>
        <Link color="primary" href="#" onClick={preventDefault}>
          See more campaigns
        </Link>
      </div>
    </React.Fragment>
  );
}
