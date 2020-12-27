db.getSiblingDB("$external").auth(
  {
    mechanism: "MONGODB-X509",
    user: "CN=App1,OU=Applications,O=CanteraFonseca,C=ES"
  }
);
