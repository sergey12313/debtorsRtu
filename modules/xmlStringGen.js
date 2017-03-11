/**
 * Created by sergey on 10.02.17.
 */
"use strict";
const config = require ("./../configs/configs.json");
const builder = require('xmlbuilder');
const PRETTYXML={pretty:config.xml.prettyXml};
const LOGIN=config.rtu.login;
const PASSWORD=config.rtu.password;
/*
let test_cappaciti={
    "owner_capacity":3,
    "in_capacity":3,
    "out_capacity":3,
    "total_capacity":3,


};
let test_group={
    "All":true,
    "SetFwd":true,
    "Forward":true,
    "Transfer":true,


};
*/



function SetCommand(command,num) {

        this['@name']= command;
        this['@table']='User';
        this['item']={'id':num}

}
function xmlGen(obj) {
    let xml;
    try {
        xml = builder.create(obj,{encoding: 'utf-8'}).end(PRETTYXML);
    }
    catch (err){
        console.log(err);

    }
    return xml;
}

function XmlStringGen(num) {
    if (!(this instanceof XmlStringGen)){
        return new XmlStringGen(num);
    }
    this._num = num;
    this._obj = {
        'commands': {
            'authorize': {
                'login': LOGIN,
                'password': PASSWORD
            }
        }
    };
}
XmlStringGen.prototype.getNumConfigs =function () {
    this._obj.commands.command=new SetCommand("Get",this._num);
    return xmlGen(this._obj);
  
};
XmlStringGen.prototype.setDebNum=function () {
    this._obj.commands.command=new SetCommand("Edit",this._num);
    this._obj.commands.command.item.groups={};
    this._obj.commands.command.item.groups.group=[];
    this._obj.commands.command.item.in_capacity=0;
    let group={name:'deb',enabled:true};
    this._obj.commands.command.item.groups.group.push(group);
    return xmlGen(this._obj);


};
XmlStringGen.prototype.setDefault=function (groups,capacity) {
    this._obj.commands.command=new SetCommand("Edit",this._num);
    this._obj.commands.command.item.groups={};
    this._obj.commands.command.item.groups.group=[];
    this._obj.commands.command.item.owner_capacity=capacity.owner_capacity;
    this._obj.commands.command.item.in_capacity=capacity.in_capacity;
    this._obj.commands.command.item.out_capacity=capacity.out_capacity;
    this._obj.commands.command.item.total_capacity=capacity.total_capacity;

    for (let key in groups){
        let group={name:[key],enabled:groups[key]};
        this._obj.commands.command.item.groups.group.push(group);

    }


    return xmlGen(this._obj);
};
XmlStringGen.prototype.setCallLimit=function () {

};
module.exports= XmlStringGen;

//console.log(new XmlStringGen(75566).getNumConfigs());
//console.log(new XmlStringGen(20000).setDefault(test_group,test_cappaciti));
// console.log("_____________________________________________________________");
//console.log(new XmlStringGen(20000).setDebNum());
// console.log(module);