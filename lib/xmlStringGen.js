"use strict";
const config = require ("./../configs/configs.json");
const builder = require('xmlbuilder');
const generator = require('generate-password');
const PRETTYXML={pretty:config.xml.prettyXml};
const LOGIN=config.rtu.login;
const PASSWORD=config.rtu.password;



function SetCommand(command,num) {
    this['@name']= command;
    this['@table']='User';
    this['item']={'id':num}

}
function xmlGen(obj) {
   return builder.create(obj,{encoding: 'utf-8'}).end(PRETTYXML);
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
    return new Promise((resolve)=>{
        this._obj.commands.command=new SetCommand("Get",this._num);
        let xml;
        try {
            xml=xmlGen(this._obj);
        }
        catch (e){
            throw new Error(`${e} on getNumConfig `)
        }
        resolve(xml);
    });
};

XmlStringGen.prototype.setDebNum=function () {
    return new Promise(resolve=>{
        this._obj.commands.command=new SetCommand("Edit",this._num);
        this._obj.commands.command.item.groups={};
        this._obj.commands.command.item.groups.group=[];
        this._obj.commands.command.item.in_capacity=0;
        let group={name:'deb',enabled:true};
        this._obj.commands.command.item.groups.group.push(group);
        let xml;
        try {
            xml=xmlGen(this._obj);
        }
        catch (e){
            throw new Error(`${e} on setDebNum`)
        }
        resolve(xml);

    });
};
XmlStringGen.prototype.setWebPassword=function () {
    return new Promise(resolve=>{
        this._obj.commands.command=new SetCommand("Edit",this._num);
        this._obj.commands.command.item.web_password=generator.generate({length:8,numbers:true});
        let xml;
        try {
            xml=xmlGen(this._obj);
        }
        catch (e){
            throw new Error(`${e} on setWebPassword`)
        }
        resolve(xml);

    });
};

XmlStringGen.prototype.setCapacityAndGroups=function (obj) {
    return new Promise(resolve=>{
        this._obj.commands.command=new SetCommand("Edit",this._num);
        this._obj.commands.command.item.groups={};
        this._obj.commands.command.item.groups.group=[];
        this._obj.commands.command.item.in_capacity=obj.capacity;
        for (let key in obj.groups){
            let group={name:[key],enabled: obj.groups[key]};
            this._obj.commands.command.item.groups.group.push(group);
        }
        let xml;
        try {
            xml=xmlGen(this._obj);
        }
        catch (e){
            throw new Error(`${e} on setCapacityAndGroups`)
        }
        resolve(xml);
    });
};

XmlStringGen.prototype.setCallLimit=function () {

};
module.exports= XmlStringGen;

//console.log(new XmlStringGen(75566).getNumConfigs());
//console.log(new XmlStringGen(20000).setDefault(test_group,test_cappaciti));
// console.log("_____________________________________________________________");
//console.log(new XmlStringGen(20000).setDebNum());
// console.log(module);