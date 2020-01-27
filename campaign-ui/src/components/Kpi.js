import React from 'react';
import gql from 'graphql-tag';

const COMMENTS_SUBSCRIPTION = gql`
subscription onKpiUpdate{
  kpiUpdate(campaignIds: ["6", "9", "56", "60", "45", "52"]) {
    campaignId
    name
    value
  }
}
`;

export const Kpi = ({ campaignId, kpiName, value }) => (
  <Subscription
    subscription={COMMENTS_SUBSCRIPTION}
    variables={{ campaignId, kpiName }}
  >
    {({ data: { commentAdded }, loading }) => (
      <h4>New comment: {!loading && commentAdded.content}</h4>
    )}
  </Subscription>
);