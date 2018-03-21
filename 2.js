const rtuRequest= require('./lib/rtu-http-request');
const ParseRtuXml=require('./lib/parse-rtu-xml');
const sybaseQuery=require('./lib/sybase-query');
const rtuXmlGenerator = require('./lib/rtuXmlGenerator');
const MongoClient = require('mongodb').MongoClient;
const {difference} = require('lodash');
// sybaseQuery().then(data => {console.dir(data)})
const url = 'mongodb://192.168.33.128:27017'; //todo remove
const dbName = 'debtors';

const offDebtors = async (arr, collection) => {
  if (!Array.isArray(arr) )throw new TypeError(`arg is offDebtors not an Array`);
  let result = ''
  if (!arr.length) return result;
  for (let i = 0, length = arr.length; i < length; i += 1) {
    const currentNumber = arr[i];
    const xmlGetNumConfigs = await new rtuXmlGenerator(currentNumber).getNumConfig();
    const resNumConfigs = await rtuRequest(xmlGetNumConfigs);
    let parsedGroupAndCapacity;
    try {
      parsedGroupAndCapacity = await ParseRtuXml.getGroupsAndCapacity(resNumConfigs);
  
    } catch(err) {
      if (err.extra === 404) {
        parsedGroupAndCapacity={"number": currentNumber, "capacity": 0, "found": false};
      } else {
        console.error(`${err} on offDebtors => ParseRtuXml.getGroupsAndCapacity ${currentNumber}`);
        continue;
      }
    }
 
    if (parsedGroupAndCapacity.found) {
      const xmlSetDeb = await new rtuXmlGenerator(currentNumber).setDeb().endEdit();
      const resSetDeb = await rtuRequest(xmlSetDeb);
      try {
        const parsedSetDebResult = await ParseRtuXml.UserEditResult(resSetDeb);
      } catch(err) {
        console.error(`${err}  on offDebtors => ParseRtuXml.UserEditResult ${currentNumber}`);
        continue;
      }
    }
    try {
    
      await collection.insertOne(parsedGroupAndCapacity)
    } catch(err){
      console.error(`${err}  on offDebtors => collection.insert ${currentNumber}`);
    }
    }


}

(async ()=>{
  //const con = await mongoConnect(url);
  const con = await MongoClient.connect(url);
  const db = con.db(dbName); 
  const collection = db.collection('debNums_d1');
  // const insertMany = promisify(collection.insertMany);
  // const result = await collection.insertMany(await getFromSqlite())
  const result = await collection.find({},  {projection: {number: 1, _id:0}})
  const array = await result.toArray()
  const res = array.map(({ number }) => number )
  const sybaseData  =  await sybaseQuery()
  
  const needOff = [16666,	16668,16669,12121]
  const needOn = []
  await offDebtors(needOff, collection)
  // let needOff = difference(sybaseData,res);
  //let needOn = difference(res,sybaseData);
  

  console.log(needOff)
  console.log(needOn)
})().catch(err=>console.error(err))