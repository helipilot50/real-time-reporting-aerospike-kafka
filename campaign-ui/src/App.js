import React from 'react';
import './App.css';

import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { Campaigns } from './components/CampaignList'

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
