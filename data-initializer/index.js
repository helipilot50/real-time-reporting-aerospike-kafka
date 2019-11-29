const uuidv4 = require('uuid/v4');
const Aerospike = require('aerospike');

const config = require('config');

const client = Aerospike.client({
  hosts: [
    { addr: 'core-aerospikedb', port: 3000 }
  ],
  log: {
    level: aerospike.log.INFO
  }
})

const createData = (campaignCount, tagCount) => {
  client.connect(function (error) {
    if (error) {
      // handle failure
      console.log('Connection to Aerospike core cluster failed!')
    } else {
      // handle success
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
          tag = juuid4();
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
    }
  })
};

// Create 100 campaigns and 1000 tags per campaign
createData(100, 1000);

