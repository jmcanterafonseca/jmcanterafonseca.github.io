var config = {
  "_id": "replica-blog-config-server",
  "configsvr": true,
  "members": [
    {
      "_id": 0,
      "host": "mongo-db-statefulset-config-server-0.mongo-db-replica-config-server.sharding.svc.cluster.local:27019"
    },
    {
      "_id": 1,
      "host": "mongo-db-statefulset-config-server-1.mongo-db-replica-config-server.sharding.svc.cluster.local:27019"
    },
    {
      "_id": 2,
      "host": "mongo-db-statefulset-config-server-2.mongo-db-replica-config-server.sharding.svc.cluster.local:27019"
    }
  ]
};

rs.initiate(config);

var config = {
  "_id": "replica-blog-config-server-2",
  "configsvr": true,
  "members": [
    {
      "_id": 0,
      "host": "mongo-db-statefulset-config-server-2-0.mongo-db-replica-config-server-2.sharding.svc.cluster.local:27019"
    },
    {
      "_id": 1,
      "host": "mongo-db-statefulset-config-server-2-1.mongo-db-replica-config-server-2.sharding.svc.cluster.local:27019"
    },
    {
      "_id": 2,
      "host": "mongo-db-statefulset-config-server-2-2.mongo-db-replica-config-server-2.sharding.svc.cluster.local:27019"
    }
  ]
};

rs.initiate(config);