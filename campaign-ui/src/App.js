import React from 'react';
// import gql from 'graphql-tag';
// import { graphql } from '@apollo/react-hoc';
import './App.css';

import { makeStyles } from '@material-ui/core/styles';
// import Table from '@material-ui/core/Table';
// import TableBody from '@material-ui/core/TableBody';
// import TableCell from '@material-ui/core/TableCell';
// import TableContainer from '@material-ui/core/TableContainer';
// import TableHead from '@material-ui/core/TableHead';
// import TableRow from '@material-ui/core/TableRow';
// import Paper from '@material-ui/core/Paper';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { Campaigns } from './components/CampaignList'
import { Kpi } from './components/Kpi';

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
}));

const campaignIds = ["6", "9", "56", "60", "45", "52"];


export const CampaignAppBar = () => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar variant="regular">
          <Typography variant="h6" color="inherit">
            Campaign KPIs - Example
          </Typography>

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
