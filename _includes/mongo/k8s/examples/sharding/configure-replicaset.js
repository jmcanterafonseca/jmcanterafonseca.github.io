var config = {
  "_id": "replica-blog-sh1",
  "members": [
    {
      "_id": 0,
      "host": "mongo-db-statefulset-sh1-0.mongo-db-replica-sh1.sharding.svc.cluster.local:27018"
    },
    {
      "_id": 1,
      "host": "mongo-db-statefulset-sh1-1.mongo-db-replica-sh1.sharding.svc.cluster.local:27018"
    },
    {
      "_id": 2,
      "host": "mongo-db-statefulset-sh1-2.mongo-db-replica-sh1.sharding.svc.cluster.local:27018"
    }
  ]
};

rs.initiate(config);

var config = {
  "_id": "replica-blog-sh2",
  "members": [
    {
      "_id": 0,
      "host": "mongo-db-statefulset-sh2-0.mongo-db-replica-sh2.sharding.svc.cluster.local:27018"
    },
    {
      "_id": 1,
      "host": "mongo-db-statefulset-sh2-1.mongo-db-replica-sh2.sharding.svc.cluster.local:27018"
    },
    {
      "_id": 2,
      "host": "mongo-db-statefulset-sh2-2.mongo-db-replica-sh2.sharding.svc.cluster.local:27018"
    }
  ]
};

rs.initiate(config);