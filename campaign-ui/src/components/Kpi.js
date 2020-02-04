import React, { Component } from 'react'
import Typography from '@material-ui/core/Typography';
import { Subscription } from 'react-apollo';
import gql from 'graphql-tag';

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
      startAttention: false
    }
    this.attention = this.attention.bind(this);
  }

  attention(something) {
    this.setState({ startAttention: true })
    console.log('attention', something);
    setTimeout(() => this.setState({ startAttention: false }), 1000);
  }

  render() {
    const { startAttention } = this.state
    const type = startAttention ? 'secondary' : 'inherit';
    return (
      <Typography color={type}>
        <Subscription subscription={KPI_SUBSCRIPTION}
          variables={{ campaignId: this.state.campaignId, kpiName: this.state.kpiName }}
          shouldResubscribe={true} onSubscriptionData={this.attention}>
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
    );
  }
}


