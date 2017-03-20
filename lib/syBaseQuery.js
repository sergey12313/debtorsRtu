"use strict";

const Sybase = require('sybase');

const config = require ("./../configs/configs.json").sybase;


module.exports = function SybaseGet() {
    let sql="exec MEDIATE..spDebitorsVoIPPhonesList";
    return new Promise((resolve,reject)=>{
        let db=new Sybase(config.host,config.port,config.dbName,config.user,config.password,false,config.jar);
        db.connect((error)=>{
            if(error){
                reject(`Sybase connect error+[${error}]`)
            }
            db.query(sql,(error,data)=>{
                if(error){
                    reject(`Sybase query error+[${error}]`)
                }
                db.disconnect();
                data=data.map((element)=>{
                    if(!element['DEVICE'])reject(new Error("Sybase not property DEVICE"));
                    let elem =+element['DEVICE'];
                    if (isNaN(elem))reject(new Error("Nan on sybase array"));
                    return +element['DEVICE'];
                });
                resolve(data);

            })
        })
    })
};
