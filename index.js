const offDebtors = require("./lib/off-debtors");
const onDebtors = require("./lib/on-debtors");
const sybaseQuery = require("./lib/sybase-query");
const MongoClient = require("mongodb").MongoClient;
const { difference } = require("lodash");
const {
  url,
  dbName,
  collection: collectionName
} = require("./configs/configs.json").mongo;
console.log(url, dbName, collectionName);

const timeout = ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const execute = async () => {
  const con = await MongoClient.connect(url);
  const db = con.db(dbName);
  const collection = db.collection(collectionName);
  const result = await collection.find(
    {},
    { projection: { number: 1, _id: 0 } }
  );
  const array = await result.toArray();
  const res = array.map(({ number }) => number);
  const sybaseData = await sybaseQuery();
  console.log("local,", res);
  console.log("sybase", sybaseData);
  const needOff = difference(sybaseData, res);
  const needOn = difference(res, sybaseData);
  console.log("off", needOff);
  console.log("on", needOn);
  // todo write log on mongodb
  await offDebtors(needOff, collection);
  await onDebtors(needOn, collection);
  await con.close();
  console.log("close");
};

(async () => {
  while (1) {
    await execute();
    await timeout(120000);
  }
})();
