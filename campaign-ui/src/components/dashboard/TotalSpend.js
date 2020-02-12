import React from 'react';
import Link from '@material-ui/core/Link';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Title from './Title';

function viewDetails(event) {
  event.preventDefault();
}

const useStyles = makeStyles({
  depositContext: {
    flex: 1,
  },
});

let today = new Date();

export default function TotalSpend() {
  const classes = useStyles();
  return (
    <React.Fragment>
      <Title>Total Spend</Title>
      <Typography component="p" variant="h4">
        $3,024.00
      </Typography>
      <Typography color="textSecondary" className={classes.depositContext}>
        on {today.toDateString()}
      </Typography>
      <div>
        <Link color="primary" href="#" onClick={viewDetails}>
          View details
        </Link>
      </div>
    </React.Fragment>
  );
}
