import React, { Component } from 'react'
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import { Subscription } from 'react-apollo';
import { headShake } from 'react-animations';
import { StyleSheet, css } from 'aphrodite';
import gql from 'graphql-tag';


const styles = StyleSheet.create({
  headShake: {
    animationName: headShake,
    animationDuration: '1s'
  }
});

const useStyles = makeStyles(theme => ({
  card: {
    height: 45,
    width: 70,
  },
  // control: {
  //   padding: theme.spacing(2),
  // },
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


export class Kpi extends Component {
  constructor(props) {
    super(props)

    this.state = {
      campaignId: props.campaignId,
      kpiName: props.kpiName,
      initialValue: props.initialValue,
      startShake: false
    }
    this.wiggle = this.wiggle.bind(this);
  }

  wiggle(something) {
    this.setState({ startShake: true })
    console.log('wiggle', something);
    setTimeout(() => this.setState({ startShake: false }), 1000);
  }

  render() {

    return (
      <Card variant="outlined" >
        <CardContent>
          <Typography >
            <Subscription subscription={KPI_SUBSCRIPTION}
              variables={{ campaignId: this.state.campaignId, kpiName: this.state.kpiName }}
              shouldResubscribe={true} onSubscriptionData={this.wiggle}>
              {
                ({ data, loading }) => {
                  if (data) {

                    return (data.kpiUpdate.value);
                  }
                  return (this.state.initialValue);
                }
              }
            </Subscription >

          </Typography>
        </CardContent>
      </Card >
    );
  }
}


