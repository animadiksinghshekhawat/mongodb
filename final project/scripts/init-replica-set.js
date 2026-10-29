// Run after the three MongoDB containers are up:
// docker compose exec mongo1 mongosh --file /scripts/init-replica-set.js
// Alternatively paste this config into mongosh connected to localhost:27017.
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "mongo1:27017" },
    { _id: 1, host: "mongo2:27017" },
    { _id: 2, host: "mongo3:27017" }
  ]
});
