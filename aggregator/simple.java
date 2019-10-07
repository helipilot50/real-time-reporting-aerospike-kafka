
import java.util.HashMap;
import java.util.Map;

import com.aerospike.client.AerospikeClient;
import com.aerospike.client.Key;
import com.aerospike.client.Value;
import com.aerospike.client.cdt.CTX;
import com.aerospike.client.cdt.MapOperation;
import com.aerospike.client.cdt.MapPolicy;

public class NestedCdtPlay {
	public static void main(String[] args) {
		AerospikeClient client = new AerospikeClient("172.28.128.4", 3000);
		
		Key key = new Key("test", "nestedCdt", "aKey");
		MapPolicy mp = new MapPolicy();
		String bin = "before3";
		// Create the data structure
		/*
		before3 = {
			    campaign1: {
			        id: "27d8b03d-2ed9-4e3f-b38f-5b0a865a1155",
			        execPlan1: {
			            id: "b4b0dfc6-40c6-4414-a751-4f3ddb252233",
			            name: "Sprint to the finish",
			            dataCube: {
			                views: 235,
			                clicks: 23,
			                conversions: 1,
			            }
			        },
			        execPlan2: {
			            id: "34e5af5d-e744-4e26-a941-bd7802c27fc2",
			            name: "Main campain execution",
			            dataCube: {
			                views: 13500,
			                clicks: 1978,
			                conversions: 245,
			            }
			        },
			        execPlan3: {
			            id: "c2e147c7-b7ef-440e-a993-91969a4fc3c1",
			            name: "Market test",
			            dataCube: {
			                views: 235,
			                clicks: 23,
			                conversions: 1,
			            }
			        }
			    }
			}
			*/
		
		Map<String, Integer> dataCube = new HashMap<>();
		dataCube.put("views", 235);
		dataCube.put("clicks", 23);
		dataCube.put("conversions", 1);
		Map<Object,Object> execPlan = new HashMap<>();
		execPlan.put("id", "b4b0dfc6-40c6-4414-a751-4f3ddb252233");
		execPlan.put("name", "Sprint to the finish");
		execPlan.put("dataCube", dataCube);
		Map<Object, Object> campaignMap = new HashMap<>();
		campaignMap.put("id", "27d8b03d-2ed9-4e3f-b38f-5b0a865a1155");
		campaignMap.put("execPlan1", execPlan);

		dataCube = new HashMap<>();
		dataCube.put("views", 13500);
		dataCube.put("clicks", 1978);
		dataCube.put("conversions", 245);
		execPlan = new HashMap<>();
		execPlan.put("id", "34e5af5d-e744-4e26-a941-bd7802c27fc2");
		execPlan.put("name", "Main campain execution");
		execPlan.put("dataCube", dataCube);
		campaignMap.put("execPlan2", execPlan);

		dataCube = new HashMap<>();
		dataCube.put("views", 235);
		dataCube.put("clicks", 23);
		dataCube.put("conversions", 1);
		execPlan = new HashMap<>();
		execPlan.put("id", "c2e147c7-b7ef-440e-a993-91969a4fc3c1");
		execPlan.put("name", "Market Test");
		execPlan.put("dataCube", dataCube);
		campaignMap.put("execPlan3", execPlan);

		
		client.delete(null, key);
		client.operate(null, key,
			MapOperation.setMapPolicy(mp, bin),
			MapOperation.put(mp, bin, Value.get("campaign1"), Value.get(campaignMap))
		);
		
		System.out.println(client.get(null, key));
		
		// Now increment campaign.execPlan2.dataCube.clicks
		client.operate(null, key, 
				MapOperation.increment(mp, bin, Value.get("clicks"), Value.get(1), 
						CTX.mapKey(Value.get("campaign1")), CTX.mapKey(Value.get("execPlan2")), CTX.mapKey(Value.get("dataCube"))));
		System.out.println(client.get(null, key));
		client.close();
	}
}