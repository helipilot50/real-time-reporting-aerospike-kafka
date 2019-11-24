package net.helipilot50.aerospike.data;

public interface Constants {
    public final String NAMESPACE = "test";

    public final String CAMPAIGN_SET = "campaigns";
    public final String TAG_SET = "tags";
    public final String STATS_BIN = "stats";
    public final String CAMPAIGN_NAME_BIN = "c-name";
    public final String CAMPAIGN_ID_BIN = "c-id";

    public final String CORE_AEROSPIKLE_HOST = "core-aerospikedb";

    public final String EVENT_TOPIC = "ad.events";
    public final String KAFKA_CLUSTER = "kafka:9092";
}