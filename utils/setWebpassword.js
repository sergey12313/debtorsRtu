'use strict';
const XmlStringGen=require("./../lib/xmlStringGen");
const rtuRequest= require('./../lib/RtuHttpRequest');
const ParseRtuXml=require('./../lib/ParseRtuXml');
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
