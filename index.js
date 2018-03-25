const rtuRequest = require("./lib/RTU-http-request");
const { parseRtuXmlGet, parseRtuXmlSet } = require("./lib/RTU-parse-xml");
const sybaseQuery = require("./lib/sybase-query");
const rtuXmlGenerator = require("./lib/RTU-xml-generator");
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

const offDebtors = async (arr, collection) => {
  if (!Array.isArray(arr))
    throw new TypeError(`arg is offDebtors not an Array`);
  if (!arr.length) return;
  for (let i = 0, length = arr.length; i < length; i += 1) {
    const currentNumber = arr[i];
    const xmlGetNumConfigs = await new rtuXmlGenerator(
      currentNumber
    ).getNumConfig();
    const resNumConfigs = await rtuRequest(xmlGetNumConfigs);
    let parsedGroupAndCapacity;
    try {
      parsedGroupAndCapacity = await parseRtuXmlGet(resNumConfigs);
    } catch (err) {
      if (err.code === 404) {
        parsedGroupAndCapacity = {
          number: currentNumber,
          capacity: 0,
          found: false
        };
      } else {
        console.error(
          `${err} on offDebtors => ParseRtuXml.getGroupsAndCapacity ${currentNumber}`
        );
        continue;
      }
    }
    if (parsedGroupAndCapacity.found) {
      const xmlSetDeb = await new rtuXmlGenerator(currentNumber)
        .setDeb()
        .endEdit();
      const resSetDeb = await rtuRequest(xmlSetDeb);
      try {
        const parsedSetDebResult = await parseRtuXmlSet(resSetDeb);
      } catch (err) {
        console.error(
          `${err}  on offDebtors => ParseRtuXml.UserEditResult ${currentNumber}`
        );
        continue;
      }
    }
    try {
      await collection.insertOne(parsedGroupAndCapacity);
    } catch (err) {
      console.error(
        `${err}  on offDebtors => collection.insert ${currentNumber}`
      );
    }
  }
};
const onDebtors = async (arr, collection) => {
  if (!Array.isArray(arr))
    throw new TypeError(`arg is offDebtors not an Array`);
  if (!arr.length) return;
  for (let i = 0, length = arr.length; i < length; i += 1) {
    const currentNumber = arr[i];
    try {
      const settingsFromDb = await collection.findOne({
        number: currentNumber
      });
      const { found = false } = settingsFromDb;
      if (found) {
        const xmlSetDef = await new rtuXmlGenerator(currentNumber)
          .setGroupAndCapacity(settingsFromDb)
          .endEdit();
        const editResponse = await rtuRequest(xmlSetDef);
        const resultEditResponse = await parseRtuXmlSet(editResponse);
      }
      const result12 = await collection.deleteOne({
        number: currentNumber
      });
    } catch (err) {
      console.error(err);
    }
  }
  return true;
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
