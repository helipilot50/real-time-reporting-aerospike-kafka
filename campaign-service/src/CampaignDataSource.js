const Aerospike = require('aerospike');
const config = require('config');
const { ApolloError } = require('apollo-server');

let _asClient;

const asPort = parseInt(process.env.CORE_PORT) || "localhost";
const asHost = process.env.CORE_HOST || 3000;


const asClient = async function () {
  try {
    if (!_asClient) {
      _asClient = await Aerospike.connect({
        hosts: [
          { addr: asHost, port: asPort }
        ],
        policies: {
          read: new Aerospike.ReadPolicy({
            totalTimeout: 1000
          }),
          write: new Aerospike.WritePolicy({
            totalTimeout: 1000
          }),
        },
        log: {
          level: Aerospike.log.INFO
        }
      });
    }
    return _asClient;
  } catch (err) {
    let errorMessage = `Failed to connect to Aerospike - ${err}`;
    throw new Error(errorMessage);
  }
};

const campaignFromRecord = (record) => {
  let campaign = {
    id: record.bins[config.campaignIdBin],
    name: record.bins[config.campaignNameBin],
    aggregateKPIs: record.bins[config.statsBin]
  };
  return campaign;
};

class CampaignDataSource {
  constructor() {

  }

  async listCampaigns() {
    try {
      let campaigns = [];

      let client = await asClient();
      let query = client.query(config.namespace, config.campaignSet);

      // filter by campaign date for today -- demo only
      let startDate = new Date();
      startDate.setHours(0);
      startDate.setMinutes(0);
      startDate.setSeconds(0);
      startDate.setMilliseconds(0);
      let endDate = new Date(startDate);
      endDate.setHours(23);
      endDate.setMinutes(59);
      endDate.setSeconds(59);
      endDate.setMilliseconds(999);

      query.where(Aerospike.filter.range(config.campaignDate, startDate.getTime(), endDate.getTime()));

      let stream = query.foreach();

      return new Promise((resolve, reject) => {
        stream.on('data', (record) => {
          let campaign = campaignFromRecord(record);
          campaigns.push(campaign);
        });
        stream.on('error', (error) => {
          console.error('Aerospike select error', error);
          reject(error);
        });
        stream.on('end', () => {
          resolve(campaigns);
        });
      });
    } catch (err) {
      console.error(`List campaigns error:`, err);
      throw new ApolloError(`List campaigns error:`, err);
    }
  }

  async fetchCampaign(id) {
    try {
      let client = await asClient();
      let key = new Aerospike.Key(config.namespace, config.campaignSet, parseInt(id));
      let record = await client.get(key);
      return campaignFromRecord(record);
    } catch (err) {
      if (err.code && err.code == 2) {
        throw new ApolloError(`Campaign ${id} not found`);
      } else {
        console.error('Fetch campaign error:', err);
        throw new ApolloError(`Fetch campaign by ID: ${id}`, err);
      }
    }
  }
  async fetchCampaignsById(campaignIds) {
    try {
      let client = await asClient();
      let keys = campaignIds.map((id) => {
        return {
          key: new Aerospike.Key(config.namespace, config.campaignSet, parseInt(id)),
          read_all_bins: true
        };
      });
      let records = await client.batchRead(keys);
      records = records.filter(n => n.status == 0);
      let campaigns = records.map((element) => {
        return campaignFromRecord(element.record);
      });
      return campaigns;
    } catch (err) {
      console.error(`fetchCampaignsById: ${campaignIds}`, err);
      throw new ApolloError(`fetchCampaignsById: ${campaignIds}`, err);
    }
  }
}

module.exports = {
  CampaignDataSource
}