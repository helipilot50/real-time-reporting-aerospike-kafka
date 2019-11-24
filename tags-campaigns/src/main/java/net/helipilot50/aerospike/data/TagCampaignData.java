package net.helipilot50.aerospike.data;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Properties;
import java.util.Timer;

import org.apache.kafka.clients.consumer.Consumer;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.serialization.LongDeserializer;
import org.apache.kafka.common.serialization.StringDeserializer;

import com.aerospike.client.AerospikeClient;
import com.aerospike.client.AerospikeException.Connection;
import com.aerospike.client.Bin;
import com.aerospike.client.Key;
import com.aerospike.client.Record;
import com.aerospike.client.Value;
import com.aerospike.client.cdt.MapOperation;
import com.aerospike.client.cdt.MapPolicy;

/**
 * Producer
 *
 */
public class TagCampaignDataMain {

    private static List<String> tags = null;

    private static List<String> createData(AerospikeClient client, int campaignCount, int tagCount) {
        List<String> tags = new ArrayList<String>();
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
                    tags.add(tag);
                    bw.append(tag);
                }
            }
            bw.close();
        } catch (IOException e) {
            System.out.println(e.getMessage());
        }
        return tags;
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

    private static Consumer<Long, String> createConsumer() {
        final Properties props = new Properties();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, Constants.KAFKA_CLUSTER);
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        // Create the consumer using props.
        final Consumer<Long, String> consumer = new KafkaConsumer<>(props);
        // Subscribe to the topic.
        consumer.subscribe(Collections.singletonList(Constants.EVENT_TOPIC));
        return consumer;
    }

    static {
        AerospikeClient client = new AerospikeClient(Constants.CORE_AEROSPIKLE_HOST, 3000);
        tags = createData(client, 20, 1000);
        client.close();

    }

    public static void main(String[] args) {
        System.out.println("Aggregator");
        AggregatorMain producer = new AggregatorMain();
    }

    private AerospikeClient asClient;

    public TagCampaignDataMain() {
        int attempts = 0;
        boolean attemptConnection = true;
        while (attemptConnection) {
            attempts += 1;
            try {
                System.out.println("Connect to core aerospike, attempt: " + attempts);
                this.asClient = new AerospikeClient(Constants.CORE_AEROSPIKLE_HOST, 3000);
                attemptConnection = false;
            } catch (Connection conn) {
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                if (attempts > 2) {
                    attemptConnection = false;
                    System.out.println("Cannot connect to core aerospike, attempted: " + attempts);
                    throw conn;
                }
            }
        }
    }

    public void aggregateEvent(String event, String tag) {
        MapPolicy mp = new MapPolicy();

        Long now = System.currentTimeMillis();

        // fetch campaign for tag
        Key tagKey = new Key(Constants.NAMESPACE, Constants.TAG_SET, tag);
        Record tagRecord = asClient.get(null, tagKey);

        // update campaign stats
        Key campaignKey = new Key(Constants.NAMESPACE, Constants.CAMPAIGN_SET,
                tagRecord.getString(Constants.CAMPAIGN_ID_BIN));
        // datacube.clicks
        asClient.operate(null, campaignKey, MapOperation.increment(mp, Constants.STATS_BIN, Value.get("clicks"),
                Value.get(1), CTX.mapKey(Value.get("dataCube"))));
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
