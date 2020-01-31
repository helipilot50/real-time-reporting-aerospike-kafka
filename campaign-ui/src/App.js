import React from 'react';
import './App.css';

import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { Campaigns } from './components/CampaignList';
import { Kpi } from './components/Kpi';

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
}));

const campaignIds = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];


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
      <Kpi campaignId={1} kpiName="impressions" initialValue={0} />
      <Kpi campaignId={3} kpiName="impressions" initialValue={0} />
      <Kpi campaignId={5} kpiName="impressions" initialValue={0} />
      <Kpi campaignId={7} kpiName="impressions" initialValue={0} />
      <Kpi campaignId={9} kpiName="impressions" initialValue={0} />

    </div>
  );
}

export default App;
