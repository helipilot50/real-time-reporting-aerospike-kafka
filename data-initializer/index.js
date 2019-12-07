const uuidv4 = require('uuid/v4');
const Aerospike = require('aerospike');

const config = require('config');

const asPort = parseInt(process.env.CORE_PORT);
const asHost = process.env.CORE_HOST;

console.log('Aerospike Env', asHost, asPort);

const createData = async (campaignCount, tagCount) => {
  try {
    let _client = Aerospike.client({
      hosts: [
        { addr: asHost, port: asPort }
      ],
      log: {
        level: Aerospike.log.INFO
      }
    });

    let asClient = await _client.connect();
    console.log('Connection to Aerospike core cluster succeeded!')

    let tagIndex = 0;
    // create campaigns
    for (i = 0; i < campaignCount; i++) {
      let campaignId = uuidv4();
      // write campaign
      campaignKey = new Aerospike.Key(config.namespace, config.campaignSet, campaignId);
      let bins = {};
      bins[config.campaignIdBin] = campaignId;
      bins[config.statsBin] = {
        clicks: 0,
        impressions: 0,
        visits: 0,
        conversions: 0,
      };
      bins[config.campaignNameBin] = `Acme campaign ${i}`;

      client.put(campaignKey, bins);

      // create tags for campaign
      for (j = 0; j < tagCount; j++) {
        tag = uuid4();
        // write tag-campaign mapping to aerospike
        tagKey = new Aerospike.Key(config.namespace, config.tagSet, tag);
        let tabBins = {};
        bins[config.campaignIdBin] = campaignId;
        client.put(tagKey, tagBins);
        // add to list of tags
        tagListKey = new Aerospike.Key(config.namespace, config.tagSet, tagIndex);
        client.put(null, tagListKey, tag);
        tagIndex += 1;
      }
    }
  } catch (error) {
    console.error("Error: ", error);
  }
  process.exit(0);
};

// Create 100 campaigns and 1000 tags per campaign
createData(100, 1000);

