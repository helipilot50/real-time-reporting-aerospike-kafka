import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import { Subscription } from 'react-apollo';

import gql from 'graphql-tag';



const useStyles = makeStyles(theme => ({
  card: {
    maxWidth: 80,
    height: 50,
    width: 80,
  },
  control: {
    padding: theme.spacing(2),
  },
}));


const KPI_SUBSCRIPTION = gql`
subscription kpiUpdate($campaignId: ID!, $kpiName:String!){
  kpiUpdate(campaignId: $campaignId, kpiName: $kpiName) {
    campaignId
    name
    value
  }
}
`;

export const Kpi = ({ campaignId, kpiName, initialValue }) => {
  const classes = useStyles();
  return (
    <Card className={classes.card} variant="outlined">
      <CardContent>
        <Typography>
          <Subscription subscription={KPI_SUBSCRIPTION} variables={{ campaignId, kpiName }} shouldResubscribe={true}>
            {
              ({ data, loading }) => {
                if (data) {

                  return (data.kpiUpdate.value);
                }
                return (initialValue);
              }
            }
          </Subscription >

        </Typography>
      </CardContent>
    </Card >
  )
};


// console.log(`id: ${data.kpiUpdate.campaignId} kpi: ${data.kpiUpdate.name} data: ${data.kpiUpdate.value}`);