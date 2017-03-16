'use strict';
const db = require('sqlite');
const Log=require('log');
const fs = require('fs');
const {logPath,sqliteFile}=require('./configs/configs.json');
const {difference,range} = require('lodash');
const XmlStringGen=require("./lib/xmlStringGen");
const rtuRequest= require('./lib/RtuHttpRequest');
const ParseRtuXml=require('./lib/ParseRtuXml');
const logFile=`${logPath}${Date.now()}.log`;
const log= new Log('debug',fs.createWriteStream(logFile));

async function on(arr) {
    if(arr.length===0){
        return true;
    }
    for(let i=0;i<arr.length;i++){
        let item=arr[i];
        let settingsFromDb=await db.get(`SELECT * from deb WHERE id=${item}`);
        settingsFromDb.groups=JSON.parse(settingsFromDb.groups);

        let XmlSetDef=await XmlStringGen(item).setCapacityAndGroups(settingsFromDb);
        console.log(XmlSetDef);
    }

}

async function off(arr) {
    if(arr.length===0){
        return true;
    }
    for(let i=0;i<arr.length;i++){
        let item=arr[i];
        let xmlGetNumConfigs=await XmlStringGen(item).getNumConfigs();
        let resNumConfigs=await rtuRequest(xmlGetNumConfigs);
        let parsedGroupAndCapacity;
        try{
            parsedGroupAndCapacity = await ParseRtuXml.getGroupsAndCapacity(resNumConfigs);//!!!

        }
        catch (e){
            if(e.extra===404){
                parsedGroupAndCapacity={"id":item,"groups":{},"capacity":0,"found":0}
            }
            throw (e );
        }
        let {id,capacity}=parsedGroupAndCapacity;
        let groups= JSON.stringify(parsedGroupAndCapacity.groups);
        let found= (parsedGroupAndCapacity.hasOwnProperty('found'))?parsedGroupAndCapacity.found:1;
        if (found===1){
            let xmlSetDeb=await XmlStringGen(item).setDebNum();
            let resSetDeb=await rtuRequest(xmlSetDeb);
            let parsedSetDebResult;
            try {
                parsedSetDebResult=await ParseRtuXml.UserEditResult(resSetDeb);
            }
            catch (e){
                log.error(e);
                continue;
            }
        }
        await db.run(`INSERT INTO deb (id,groups,capacity,found) VALUES (${id}, '${groups}',${capacity} ,${found})`);
    }
    return true
}
async function run() {
   /* let arr1=range(20000,30000);
    let arr2=range(70000,80000);
    let arr3=range(90000,95000);
    let arr=[...arr1,...arr2,...arr3];
    console.log(arr.length);*/


    let sybaseNums = await Promise.resolve([...range(16670,16675),/*...[20000]*/]);////need big exception
    await db.open(sqliteFile);
    // await db.run(`DROP TABLE deb`);
   // await db.run(`CREATE TABLE deb(id INT PRIMARY KEY,groups TEXT,capacity INT,found INT DEFAULT 1)`);
    let result = await db.all('SELECT * FROM deb');
    let localNums =result.map((item)=>{
        return item.id
    });
    let needOff = difference(sybaseNums,localNums);
    let needOn = difference(localNums,sybaseNums);
    let offResult,onResult ;
    try{
       offResult =await off(needOff);
       onResult =await on(needOn);
    }
    catch (e){
        console.log(e);
    }

    console.log('needOff',needOff);
    console.log('needOn',needOn);

    result=await db.all('SELECT * FROM deb');


}

run();
    

