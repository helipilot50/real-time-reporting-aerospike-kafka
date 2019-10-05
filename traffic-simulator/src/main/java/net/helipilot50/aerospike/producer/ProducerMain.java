package net.helipilot50.aerospike.producer;

import java.util.ArrayList;
import java.util.List;
import java.util.Timer;
import java.util.TimerTask;
import jaba.util.UUID;

import com.aerospike.client.AerospikeClient;
import com.aerospike.client.Bin;
import com.aerospike.client.Key;
import com.aerospike.client.Record;
import com.aerospike.client.Value;
import com.aerospike.client.AerospikeException.Connection;
import com.aerospike.client.cdt.MapOperation;
import com.aerospike.client.cdt.MapPolicy;

import net.helipilot50.aerospike.producer.Constants;

/**
 * Producer 
 *
 */
public class ProducerMain extends TimerTask {
    private static final int tagCount = 1000;
    private static final int campaignCount = 100;

    private static List<String> tags = new ArrayList<String>();

    private static List<String> createData(AerospikeClient client) {
        // create campaigns
        for (int i = 0; i < campaignCount; i++) {
            HashMap<String, Long> stats = new HashMap<String, Long>();
            stats.put("clicks", 0L);
            stats.put("views", 0L);
            stats.put("conversions", 0L);
            String campaignId = java.util.UUID.randomUUID().toString();
            // write campaign
            Key campaignKey = new Key(Constants.NAMESPACE, Constants.CAMPAIGN_SET, campaignId);
            Bin statsBin = new Bin(STATS_BIN, campaignId);
            client.put(null, campaignKey, statsBin);
            // create tags
            for (int j = 0; j < tagCount; j++) {
                String tag = java.util.UUID.randomUUID().toString();
                // write tag-campaign mapping to aerospike
                Key tagKey = new Key(Constants.NAMESPACE, Constants.TAG_SET, tag);
                Bin campaignIdBin = new Bin(Constants.CAMPAIGN_ID_BIN, stats);
                client.put(null, tagKey, campaignIdBin);
                // add to list of tags
                tags.append(tag);
            }
        }
    }

    private static String randomTag() {
        int index = (int) (Math.random() * tags.size());
        return tags.get(index);
    }

    private static String eventType() {
        int index = (int) (Math.random() * 50);
        if (index < 4)
            return "conversion";
        if (index >= 4 && index <= 15)
            return "click";
        return "view";
    }

    public static void main(String[] args) {
        System.out.println("Traffic simulator");
        AerospikeClient client = new AerospikeClient(CORE_AEROSPIKLE_HOST, 3000);
        createData(client);
        client.close();

        ProducerMain producer = new ProducerMain();
        Timer timer = new Timer();
        timer.schedule(producer, 0, 500);
    }

    public AerospikeClient asClient;

    public ProducerMain() {
        int attempts = 0;
        boolean attemptConnection = true;
        while (attemptConnection) {
            attempts += 1;
            try {
                System.out.println("Connect to edge aerospike, attempt: " + attempts);
                this.asClient = new AerospikeClient(EDGE_AEROSPIKLE_HOST, 3000);
                attemptConnection = false;
            } catch (Connection conn) {
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    // TODO Auto-generated catch block
                    e.printStackTrace();
                }
                if (attempts > 2) {
                    attemptConnection = false;
                    System.out.println("Cannot connect to edge aerospike, attempted: " + attempts);
                    throw conn;
                }
            }
        }
    }

    @Override
    public void run() {
        String tag = randomTag();
        String event = eventType();
        System.out.println(String.format("Event: %s for %s", event, tag));
        addEvent(event, tag);
    }

    public void addEvent(String event, String tag) {

        Long now = System.currentTimeMillis();

        Key recordKey = new Key(Constants.NAMESPACE, Constants.EVENT_SET, tag+now);

        Bin typeBin = new Bin(Constants.EVENT_TYPE_BIN, event);
        Bin tagBin = new Bin(Constants.EVENT_TAG_BIN, tag);
        Bin tsBin = new Bin(Constants.TIME_STAMP_BIN, now);

        asClient.put(null, recordKey, typeBin, tagBin, tsBin);
        return;
    }

    /**
     * close the Aerospike client on process termination
     */
    protected void finalize() {
        this.asClient.close();
        this.asClient = null;
    }

}
