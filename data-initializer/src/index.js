const uuidv4 = require('uuid/v4');
const Aerospike = require('aerospike');
const sleep = require('sleep');
const config = require('config');

const asPort = parseInt(process.env.CORE_PORT);
const asHost = process.env.CORE_HOST;

sleep.sleep(5);
console.log('Aerospike cluster', asHost, asPort);

const createData = async (campaignCount, tagCount) => {
  let asClient;
  try {
    const asConfig = {
      hosts: [
        { addr: asHost, port: asPort }
      ],
      policies: {
        read: new Aerospike.ReadPolicy({
          totalTimeout: 500
        }),
        write: new Aerospike.WritePolicy({
          totalTimeout: 500
        }),
      },
      log: {
        level: Aerospike.log.INFO
      }
    };
    let connectionAttempts = 0;
    while (asClient == null && connectionAttempts < 3) {
      connectionAttempts += 1;
      try {
        asClient = await Aerospike.connect(asConfig);
      } catch (error) {
        if (connectionAttempts >= 3) {
          console.error(`Cannot connect to Aerospike after ${connectionAttempts} attempts`)
          throw error;
        } else {
          sleep.sleep(1);
        }
      }
    }
    console.log('Connection to Aerospike core cluster succeeded!')

    /*
    if data exists do nothing
    */
    let testKey = new Aerospike.Key(config.namespace, config.tagSet, 1);
    let dataExists = await asClient.exists(testKey);
    if (dataExists) {
      asClient.close();
      console.log('Data already initialized... doing nothing');
      return;
    }
    let tagIndex = 1;
    // create campaigns
    for (i = 0; i < campaignCount; i++) {
      let campaignId = uuidv4();
      // write campaign
      let campaignKey = new Aerospike.Key(config.namespace, config.campaignSet, campaignId);
      let bins = {};
      bins[config.campaignIdBin] = campaignId;
      bins[config.statsBin] = {
        clicks: 0,
        impressions: 0,
        visits: 0,
        conversions: 0,
      };
      bins[config.campaignNameBin] = `Acme campaign ${i}`;

      let returnCode = await asClient.put(campaignKey, bins);

      // create tags for campaign
      for (j = 0; j < tagCount; j++) {
        tag = uuidv4();
        // write tag-campaign mapping to aerospike
        let tagKey = new Aerospike.Key(config.namespace, config.tagSet, tag);
        let tagBins = {};
        tagBins[config.campaignIdBin] = campaignId;
        await asClient.put(tagKey, tagBins);
        // add to list of tags
        let tagListKey = new Aerospike.Key(config.namespace, config.tagSet, tagIndex);
        await asClient.put(tagListKey, tagBins);
        tagIndex += 1;
      }
    }
    console.log(`Completed creating ${campaignCount} campaigns with ${tagCount} each`)
  } catch (error) {
    console.error("Error: ", error);
  } finally {
    if (asClient)
      asClient.close();
  }
};

// Create 100 campaigns and 1000 tags per campaign
createData(100, 1000);

