db.getSiblingDB("$external").runCommand(
  {
    createUser: "CN=App1,OU=Applications,O=CanteraFonseca,C=ES",
    roles: [
      { role: "readWrite", db: 'test' },
      { role: "userAdminAnyDatabase", db: "admin" },
      { role: "clusterAdmin", db: "admin" }
    ],
    writeConcern: { w: "majority", wtimeout: 5000 }
  }
);

db.getSiblingDB("$external").runCommand(
  {
    createUser: "CN=mongo-db-statefulset-sh1-0.mongo-db-replica-sh1.sharding,OU=Software,O=CanteraFonseca,C=ES",
    roles: [
      { role: "__system", db: "admin" }
    ],
    writeConcern: { w: "majority", wtimeout: 5000 }
  }
);

db.getSiblingDB("$external").runCommand(
  {
    createUser: "CN=mongo-db-statefulset-sh1-1.mongo-db-replica-sh1.sharding,OU=Software,O=CanteraFonseca,C=ES",
    roles: [
      { role: "__system", db: "admin" }
    ],
    writeConcern: { w: "majority", wtimeout: 5000 }
  }
);

db.getSiblingDB("$external").runCommand(
  {
    createUser: "CN=mongo-db-statefulset-sh1-2.mongo-db-replica-sh1.sharding,OU=Software,O=CanteraFonseca,C=ES",
    roles: [
      { role: "__system", db: "admin" }
    ],
    writeConcern: { w: "majority", wtimeout: 5000 }
  }
);

db.getSiblingDB("$external").runCommand(
  {
    createUser: "CN=mongos.sharding,OU=Software,O=CanteraFonseca,C=ES",
    roles: [
      { role: "__system", db: "admin" }
    ],
    writeConcern: { w: "majority", wtimeout: 5000 }
  }
);


db.getSiblingDB("$external").runCommand(
  {
    createUser: "CN=mongo-db-statefulset-sh2-0.mongo-db-replica-sh2.sharding,OU=Software,O=CanteraFonseca,C=ES",
    roles: [
      { role: "__system", db: "admin" }
    ],
    writeConcern: { w: "majority", wtimeout: 5000 }
  }
);

db.getSiblingDB("$external").runCommand(
  {
    createUser: "CN=mongo-db-statefulset-sh2-1.mongo-db-replica-sh2.sharding,OU=Software,O=CanteraFonseca,C=ES",
    roles: [
      { role: "__system", db: "admin" }
    ],
    writeConcern: { w: "majority", wtimeout: 5000 }
  }
);

db.getSiblingDB("$external").runCommand(
  {
    createUser: "CN=mongo-db-statefulset-sh2-2.mongo-db-replica-sh2.sharding,OU=Software,O=CanteraFonseca,C=ES",
    roles: [
      { role: "__system", db: "admin" }
    ],
    writeConcern: { w: "majority", wtimeout: 5000 }
  }
);

db.getSiblingDB("$external").runCommand(
  {
    createUser: "CN=mongos.sharding,OU=Software,O=CanteraFonseca,C=ES",
    roles: [
      { role: "__system", db: "admin" }
    ],
    writeConcern: { w: "majority", wtimeout: 5000 }
  }
);