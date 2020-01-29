import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import gql from 'graphql-tag';



const useStyles = makeStyles(theme => ({
  card: {
    maxWidth: 120,
    height: 70,
    width: 120,
  },
  control: {
    padding: theme.spacing(2),
  },
}));


const COMMENTS_SUBSCRIPTION = gql`
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
          {kpiName}
        </Typography>
        <Typography>
          {value}
        </Typography>
      </CardContent>
    </Card>
  )
};