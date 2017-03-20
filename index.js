'use strict';
const db = require('sqlite');
const Log=require('log');
const fs = require('fs');
const {logPath,sqliteFile}=require('./configs/configs.json');
const {difference,range} = require('lodash');
const XmlStringGen=require("./lib/xmlStringGen");
const rtuRequest= require('./lib/RtuHttpRequest');
const ParseRtuXml=require('./lib/ParseRtuXml');
const logFile=`${logPath}/my.log`;
const log= new Log('debug',fs.createWriteStream(logFile,{flags:'a'}));

async function on(arr) {
    if(arr.length===0){
        return true;
    }
    for(let i=0;i<arr.length;i++){
        let item=arr[i];
        try{
            let settingsFromDb=await db.get(`SELECT * from deb WHERE id=${item}`);

            if(!settingsFromDb.found){
                await db.run(`DELETE FROM deb WHERE id ='${item}'`);
            }
            else{
                settingsFromDb.groups=JSON.parse(settingsFromDb.groups);
                let XmlSetDef=await XmlStringGen(item).setCapacityAndGroups(settingsFromDb);
                let editRes = await rtuRequest(XmlSetDef);
                let resultEditRes= await ParseRtuXml.UserEditResult(editRes);
                if(resultEditRes){
                    await db.run(`DELETE FROM deb WHERE id ='${item}'`);
                }
                else {
                    throw new Error(`result at function 'on' from number ${item} false `)
                }

            }
        }
        catch (e){
            log.error(e);

        }

    }
    return true;

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
            else{
                log.error(e);
                continue;
            }
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
   let arr1=range(20000,30000);



    let sybaseNums = await Promise.resolve([...range(16666,16674),/*...[20000]*/]);////need big exception
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
    log.info('needOff',needOff);
    log.info('needOn',needOn);

    result=await db.all('SELECT * FROM deb');


}



let  timerId = setTimeout(function tick() {
    run();
    timerId = setTimeout(tick, 20000);
}, 20000);

