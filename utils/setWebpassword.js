'use strict';
const XmlStringGen=require("./../lib/xml-string-gen");
const rtuRequest= require('./../lib/rtu-http-request');
const ParseRtuXml=require('./../lib/parse-rtu-xml');
 const arr=[


 ];



 async function setPass() {
     arr.forEach(async(item)=>{
         let xml =await XmlStringGen(item).setWebPassword();
         console.log(xml);
         let res =await rtuRequest(xml);
         let result = await ParseRtuXml.UserEditResult(res);
         console.log(result);
     });


 }
 setPass();
