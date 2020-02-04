import React from 'react';

import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import { Kpi } from './Kpi';


export default function CampaignRow({ campaign }) {
  return (
    <TableRow key={campaign.id}>
      <TableCell component="th" scope="row">{campaign.id}</TableCell>
      <TableCell align="left" minwidth={200}>{campaign.name}</TableCell>
      <TableCell align="right"><Kpi campaignId={campaign.id} kpiName="impressions" initialValue={campaign.aggregateKPIs.impressions} /></TableCell>
      <TableCell align="right"><Kpi campaignId={campaign.id} kpiName="clicks" initialValue={campaign.aggregateKPIs.clicks} /></TableCell>
      <TableCell align="right"><Kpi campaignId={campaign.id} kpiName="visits" initialValue={campaign.aggregateKPIs.visits} /></TableCell>
      <TableCell align="right"><Kpi campaignId={campaign.id} kpiName="conversions" initialValue={campaign.aggregateKPIs.conversions} /></TableCell>
    </TableRow>
  )
}
