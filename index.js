'use strict';

const db = require('sqlite');
const {difference,range} = require('lodash');
const XmlStringGen=require("./lib/xmlStringGen");
const rtuRequest= require('./lib/RtuHttpRequest');
const ParseRtuXml=require('./lib/ParseRtuXml');

async function on() {

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
            else {
                throw (e);
            }
        }
        let {id,capacity}=parsedGroupAndCapacity;
        let groups= JSON.stringify(parsedGroupAndCapacity.groups);
        let found= (parsedGroupAndCapacity.hasOwnProperty('found'))?parsedGroupAndCapacity.found:1;
        let run = await db.run(`INSERT INTO deb (id,groups,capacity,found) VALUES (${id}, '${groups}',${capacity} ,${found})`);
        //console.log(run);
    }

}
async function run() {
    let arr1=range(20000,30000);
    let arr2=range(70000,80000);
    let arr3=range(90000,95000);
    let arr=[...arr1,...arr2,...arr3];
    console.log(arr.length);


    let sybaseNums = await Promise.resolve(arr);
    await db.open('./configs/db.sqlite');
    // await db.run(`DROP TABLE deb`);
    //await db.run(`CREATE TABLE deb(id INT PRIMARY KEY,groups TEXT,capacity INT,found INT DEFAULT 1)`);
    let result = await db.all('SELECT * FROM deb');
    let localNums =result.map((item)=>{
        return item.id
    });
    let needOff = difference(sybaseNums,localNums);
    let needOn = difference(localNums,sybaseNums);
    let offResult;
    try{
       offResult =await off(needOff);
    }
    catch (e){
        console.log(e);
    }

    console.log('needOff',needOff);
    console.log('needOn',needOn);

    result=await db.all('SELECT * FROM deb');


}

run();
    

