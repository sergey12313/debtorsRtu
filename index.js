/**
 * Created by sergey on 14.02.17.
 */
"use strict";
const XmlStringGen=require("./lib/xmlStringGen");
const ProgressBar = require('progress');
const rtuRequest=require("./lib/RtuRequest");
const parseResponseXml = require('./lib/ParseRtuXml');
const co = require("co");
let Log = require('log')
    , fs = require('fs')
    , log = new Log('debug', fs.createWriteStream('my.log'));

async function rtu(num) {
    let xml = XmlStringGen(num).getNumConfigs();
    let res = await rtuRequest(xml);
    return parseResponseXml(res).parseRtuResponse().getGroupsAndCapacity();
}



let num =[20000,75566,24757,12345];
/*for(let i=20000; i<=20220;i++){
    num.push(i);
}*/

log.error("123");
async function test(){
    let dateStart =new Date();
    let result = [];
    var bar = new ProgressBar('Rtu Upload [:bar] ', { total: num.length });
     for(let i=0; i<num.length;i++){
        let res;

        try {
            res= await rtu(num[i])
        }
        catch (e){
            if(e.name==='XmlParserError' && e.extra==='not_found'){
                res = {
                    id: `${num[i]}`,
                    capacity:`${0}`,
                    groups:`not_found`

                }
            }
            else {
               console.log(e)

            }

        }
        bar.tick();
       result.push(res)
    }
    let dateEnd=new Date();
    let time=(dateEnd-dateStart)/1000;
    console.log(time);
    return result;

}

test().then(r=>console.log(JSON.stringify(r,'',2))).catch(e=> console.log("E",e));



/*function *rtuGet() {
    let result={};
    let xml;
    let dateStart =new Date();
    for (let i=24300; i<24500;i++){
        try {
            if (i === 24310) {
                throw (new Error('adfsdf'));
            }
            xml = XmlStringGen(i).getNumConfigs();
            yield rtuRequest(xml).then((text) => result[i] = text);
        }
        catch (e){
            log.error("wrewer");
        }
    }
    let dateEnd=new Date();
    let time=(dateEnd-dateStart)/1000;
    return {result:result,time:time};
}
let mylog =(er)=>log.error("Jib,rf");
log.error("wrewer");
co(rtuGet).then((data)=>console.log(data.result,data.time))
    .catch(error=>log.error(error));*/


