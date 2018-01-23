'use strict';
const db = require('sqlite');
const {sqliteFile}=require('./configs/configs.json');
const {difference} = require('lodash');
// const XmlStringGen=require("./lib/xml-string-gen");
const rtuRequest= require('./lib/rtu-http-request');
const ParseRtuXml=require('./lib/parse-rtu-xml');
const sybaseQuery=require('./lib/sybase-query');
const rtuXmlGenerator = require('./lib/rtuXmlGenerator');


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
                let XmlSetDef= await new rtuXmlGenerator(item).setGroupAndCapacity(settingsFromDb).endEdit();
                //let XmlSetDef= await XmlStringGen(item).setCapacityAndGroups(settingsFromDb);
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
            console.error(e+` other error function 'on' from number ${item} false `);

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
        let xmlGetNumConfigs = await new rtuXmlGenerator(item).getNumConfig();
        // let xmlGetNumConfigs = await XmlStringGen(item).getNumConfigs();
        let resNumConfigs=await rtuRequest(xmlGetNumConfigs);
        let parsedGroupAndCapacity;
        try{
            parsedGroupAndCapacity = await ParseRtuXml.getGroupsAndCapacity(resNumConfigs);

        }
        catch (e){
            if(e.extra===404){
                parsedGroupAndCapacity={"id":item,"groups":{},"capacity":0,"found":0}
            }
            else{
                console.error(e+` other error parse on function 'off' from number ${item} `);
                continue;
            }
        }
        let {id,capacity}=parsedGroupAndCapacity;
        let groups= JSON.stringify(parsedGroupAndCapacity.groups);
        let found= (parsedGroupAndCapacity.hasOwnProperty('found'))?parsedGroupAndCapacity.found:1;
        if (found===1){
            let xmlSetDeb = await new rtuXmlGenerator(item).setDeb().endEdit();
            //let xmlSetDeb=await XmlStringGen(item).setDebNum();
            let resSetDeb=await rtuRequest(xmlSetDeb);
            let parsedSetDebResult;
            try {
                parsedSetDebResult=await ParseRtuXml.UserEditResult(resSetDeb);
            }
            catch (e){
                console.error(e+` other error function 'off' from number ${item}`);
                continue;
            }
        }
        await db.run(`INSERT INTO deb (id,groups,capacity,found) VALUES (${id}, '${groups}',${capacity} ,${found})`);
    }
    return true
}
async function run() {
    let sybaseNums;

    try{
        sybaseNums = await sybaseQuery();
    }
    catch(e) {
        console.error(e);
        return false;
    }

    await db.open(sqliteFile);
    let result = await db.all('SELECT * FROM deb');
    let localNums =result.map((item)=>{
        return item.id
    });
    let needOff = difference(sybaseNums,localNums);
    let needOn = difference(localNums,sybaseNums);
    if(needOff.length>0){
        console.log('off',needOff)
    }
    if(needOn.length>0){
        console.log('on',needOn)
    }

    let offResult,onResult ;
    try{
       offResult =await off(needOff);
       onResult =await on(needOn);
    }
    catch (e){
        console.error(e);
    }



}

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function loop() {
    while(1){
        await run();
        await timeout(120000);
    }


}

loop();

