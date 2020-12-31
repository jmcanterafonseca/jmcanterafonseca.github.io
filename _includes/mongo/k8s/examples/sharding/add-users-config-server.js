db.getSiblingDB("$external").runCommand(
  {
    createUser: "CN=mongo-db-statefulset-config-server-0,OU=Software,O=CanteraFonseca,C=ES",
    roles: [
      { role: "__system", db: "admin" }
    ],
    writeConcern: { w: "majority", wtimeout: 5000 }
  }
);

db.getSiblingDB("$external").runCommand(
  {
    createUser: "CN=mongo-db-statefulset-config-server-1,OU=Software,O=CanteraFonseca,C=ES",
    roles: [
      { role: "__system", db: "admin" }
    ],
    writeConcern: { w: "majority", wtimeout: 5000 }
  }
);

db.getSiblingDB("$external").runCommand(
  {
    createUser: "CN=mongo-db-statefulset-config-server-2,OU=Software,O=CanteraFonseca,C=ES",
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
