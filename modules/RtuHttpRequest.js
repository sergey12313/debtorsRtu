/**
 * Created by sergey on 11.03.17.
 */
'use strict';
const fetch = require('node-fetch');
const configs= require('../configs/configs.json');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

function RtuResponseXml(xml) {
    if (!(this instanceof RtuResponseXml)){
        return new RtuResponseXml(xml);
    }
    const url=`https://${configs.rtu.ip}:${configs.rtu.port}${configs.rtu.path}`;
    let options={
        body:xml,
        method:'POST',
        headers:{
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': xml.length

        }
    };
    return fetch(url,options).then((res)=>{
       if(!res.ok){
           throw new Error('Error on RtuResponseXml')
       }
        return res.text()
    })


}

