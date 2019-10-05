package net.helipilot50.aerospike.kafka;
public interface Constants {
    public final String NAMESPACE = "test";
    
    public final String EVENT_SET = "events";
    public final String EVENT_TYPE_BIN = "e-type";
    public final String EVENT_TAG_BIN = "e-tag";
    public final String TIME_STAMP_BIN = "e-time";
    public final String EDGE_AEROSPIKLE_HOST = "edge-aerospikedb";
    
    public final String CAMPAIGN_SET = "campaigns";
    public final String STATS_BIN = "stats";
    
    public final String TAG_SET = "tags";
    public final String CAMPAIGN_ID_BIN = "campaign-id";
    
    public final String CORE_AEROSPIKLE_HOST = "core-aerospikedb";
}