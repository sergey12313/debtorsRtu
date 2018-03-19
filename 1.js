const db = require('sqlite');
const {sqliteFile}=require('./configs/configs.json');
const MongoClient = require('mongodb').MongoClient;


const url = 'mongodb://192.168.33.128:27017';
const dbName = 'debtors';


const getFromSqlite = async ()=>{
  await db.open(sqliteFile);
  let result = await db.all('SELECT * FROM deb ');
  return  result.map((item)=>{
    const resultObj =  {
      number: item.id,
      capacity : item.capacity,
      found: item.found,
    }
    if(item.groups !== '{}') {
      resultObj.groups = JSON.parse(item.groups)
    }
    return resultObj;
  })
  
}

(async ()=>{
  //const con = await mongoConnect(url);
  const con = await MongoClient.connect(url);
  const db = con.db(dbName); 
  const collection = db.collection('debNums');
  // const insertMany = promisify(collection.insertMany);
  const result = await collection.insertMany(await getFromSqlite())
  console.log(result)
})().catch(err=>console.error(err))

//mongoConnect(url).then(()=>console.log('conected')).catch(err=>console.error(err))
// MongoClient.connect(url, (err, client)=>{
//   if(err) throw err
//   console.log('conected')
// })

// const getFromSqlite = async ()=>{
//   await db.open(sqliteFile);
//   let result = await db.all('SELECT * FROM deb ');
//   return  result.map((item)=>{
//     const resultObj =  {
//       number: item.id,
//       capacity : item.capacity,
//       found: item.found,
//     }
//     if(item.groups !== '{}') {
//       resultObj.groups = JSON.parse(item.groups)
//     }
//     return resultObj;
//   })
  
// }

// getFromSqlite().then(data=>console.log(data))
