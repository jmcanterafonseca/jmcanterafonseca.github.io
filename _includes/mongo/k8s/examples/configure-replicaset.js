var config = {
  "_id" : "replica-blog-1",
  "members" : [
          {
                  "_id" : 0,
                  "host" : "mongo-db-statefulset-0.mongo-db-replica.datastores.svc.cluster.local:27017"
          },
          {
                  "_id" : 1,
                  "host" : "mongo-db-statefulset-1.mongo-db-replica.datastores.svc.cluster.local:27017"
          },
          {
                  "_id" : 2,
                  "host" : "mongo-db-statefulset-2.mongo-db-replica.datastores.svc.cluster.local:27017"
          }
  ]
};

rs.initiate(config);