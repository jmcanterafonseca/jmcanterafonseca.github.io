db.getSiblingDB("\$external").grantRolesToUser("CN=App1,OU=Applications,O=CanteraFonseca,C=ES", [
  { role: "readWrite", db: 'new_db' }
], { w: "majority", wtimeout: 5000 });
