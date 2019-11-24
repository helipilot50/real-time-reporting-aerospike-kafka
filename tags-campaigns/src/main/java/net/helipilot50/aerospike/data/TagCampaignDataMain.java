package net.helipilot50.aerospike.data;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.HashMap;

import com.aerospike.client.AerospikeClient;
import com.aerospike.client.Bin;
import com.aerospike.client.Key;

/**
 * Producer
 *
 */
public class TagCampaignDataMain {

    private static void createData(AerospikeClient client, int campaignCount, int tagCount) {
        File f = new File("/tag-data/tags.txt");
        try

        {
            BufferedWriter bw = new BufferedWriter(new FileWriter(f, true));
            // create campaigns
            for (int i = 0; i < campaignCount; i++) {
                HashMap<String, Long> stats = new HashMap<String, Long>();
                stats.put("clicks", 0L);
                stats.put("impressions", 0L);
                stats.put("visits", 0L);
                stats.put("conversions", 0L);
                String campaignId = java.util.UUID.randomUUID().toString();
                // write campaign
                Key campaignKey = new Key(Constants.NAMESPACE, Constants.CAMPAIGN_SET, campaignId);
                Bin idBin = new Bin(Constants.CAMPAIGN_ID_BIN, campaignId);
                Bin statsBin = new Bin(Constants.STATS_BIN, campaignId);
                Bin nameBin = new Bin(Constants.CAMPAIGN_NAME_BIN, "Acme campaign " + 1);
                client.put(null, campaignKey, idBin, nameBin, statsBin);
                // create tags
                for (int j = 0; j < tagCount; j++) {
                    String tag = java.util.UUID.randomUUID().toString();
                    // write tag-campaign mapping to aerospike
                    Key tagKey = new Key(Constants.NAMESPACE, Constants.TAG_SET, tag);
                    Bin campaignIdBin = new Bin(Constants.CAMPAIGN_ID_BIN, stats);
                    client.put(null, tagKey, campaignIdBin);
                    // add to list of tags
                    bw.append(tag);
                }
            }
            bw.close();
        } catch (IOException e) {
            System.out.println(e.getMessage());
        }
    }

    public static void main(String[] args) {
        System.out.println("Tag Campaign Data producer");
        AerospikeClient client = new AerospikeClient(Constants.CORE_AEROSPIKLE_HOST, 3000);
        createData(client, 20, 1000);
        client.close();

    }

}
