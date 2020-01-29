import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';

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
subscription kpiUpdate{
  kpiUpdate(campaignIds: ["6", "9", "56", "60", "45", "52"]) {
    campaignId
    name
    value
  }
}
`;

export const Kpi = ({ campaignId, kpiName, value }) => {
  const classes = useStyles();
  return (
    <Card className={classes.card} variant="outlined">
      <CardContent>
        <Typography>
          {value}
        </Typography>
      </CardContent>
    </Card>
  )
};