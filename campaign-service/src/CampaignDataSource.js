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
            totalTimeout: 100
          }),
          write: new Aerospike.WritePolicy({
            totalTimeout: 100
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
      let query = client.query(config.aerospike.namespace, config.aerospike.set);

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
      let key = new Aerospike.Key(config.namespace, config.set, id);
      let record = await client.get(key);
      return campaignFromRecord(record);
    } catch (err) {
      console.error('Fetch campaign error:', err);
      throw new ApolloError(`Fetch campaign by ID ${id}:`, err);
    }
  }
}

module.exports = {
  CampaignDataSource
}