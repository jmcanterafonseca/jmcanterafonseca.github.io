var config = {
  "_id": "replica-blog-sh-1",
  "members": [
    {
      "_id": 0,
      "host": "mongo-db-statefulset-sh1-0.mongo-db-replica-sh1.sharding.svc.cluster.local:27017"
    },
    {
      "_id": 1,
      "host": "mongo-db-statefulset-sh1-1.mongo-db-replica-sh1.sharding.svc.cluster.local:27017"
    },
    {
      "_id": 2,
      "host": "mongo-db-statefulset-sh1-2.mongo-db-replica-sh1.sharding.svc.cluster.local:27017"
    }
  ]
};

rs.initiate(config);