db.getSiblingDB("$external").auth(
  {
    mechanism: "MONGODB-X509",
    user: "CN=App1,OU=Applications,O=CanteraFonseca,C=ES"
  }
);

db.getSiblingDB("$external").auth(
  {
    mechanism: "MONGODB-X509",
    user: "CN=mongos.sharding,OU=Software,O=CanteraFonseca,C=ES"
  }
);
