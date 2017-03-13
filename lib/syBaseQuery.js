"use strict";
var odbc = require("odbc");
const config = require ("./../configs/configs.json");

function SybaseGet() {
    let sql="exec MEDIATE..spDebitorsVoIPPhonesList";
    return new Promise((resolve,reject)=> {
        let db=new odbc.Database();
        let connectString=`DRIVER={FreeTDS};DSN=sv;PWD=${config.sybase.password};UID=${config.sybase.user};DATABASE=${config.sybase.dbName}`;
        db.open(connectString, function(err) {
            if(err){
                reject(err);
            }
            db.query(sql, function(err, rows, moreResultSets)
            {
                if(err){
                    reject(err)
                }
                db.close(function(){});
                rows = rows.map((element)=>{
                    if(!element['DEVICE'])reject(new Error("Sybase not property DEVICE"));
                    let elem =+element['DEVICE'];
                    if (isNaN(elem))reject(new Error("Nan on sybase array"));
                    return +element['DEVICE'];
                    });
                resolve(rows);
            });
        });




    })
}
new SybaseGet().then((data)=>console.dir( data)).catch((e)=>console.error(123,e));

