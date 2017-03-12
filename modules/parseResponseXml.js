"use strict";
//const rtuget= require('./RtuRequest');
const X2JS = require('x2js');


class XmlError extends Error{
    constructor(message,extra){
        super();
        this.message=message;
        this.name = 'XmlParserError';
        if (extra){this.extra=extra}
    }
}


function preParse() {
    if( typeof this._xml !== 'string' ){
        throw new XmlError('Не строка')
    }
    else if(this._xml.search("xml")===-1){
        throw new XmlError('Не валидный Xml')
    }
}

function ParseXml(xml,options) {
    if (!(this instanceof ParseXml)){
        return new ParseXml(...arguments);
    }
    this._xml=xml;
    this.options=options||{};
    preParse.call(this);
    let x2js = new X2JS();
    this._xmlObj=x2js.xml2js(this._xml);

}

ParseXml.prototype.parseRtuResponse= function () {
    let xmlObj=this._xmlObj;
    if(!xmlObj.hasOwnProperty('Root')){
        throw new XmlError('Нeт Root в xml');
    }
    xmlObj=this._xmlObj.Root;
    if (xmlObj.hasOwnProperty('Errors')){
        throw new XmlError(xmlObj.Errors.error._reason)
    }
    if (xmlObj.hasOwnProperty('command')
        && xmlObj.command.hasOwnProperty('item')
        &&xmlObj.command.item.hasOwnProperty('reason')
        &&xmlObj.command.item.reason.hasOwnProperty('error')){
        let err;
        err = xmlObj.command.item.reason.error;
        throw new XmlError(err,'not_found');
    }
    return this

};
ParseXml.prototype.getGroupsAndCapacity= function () {
    let optionsSaved={};
    optionsSaved.groups={};
    //optionsSaved.

    try{
        optionsSaved.id=this._xmlObj.Root.command.User.id;
       // id=JSON.stringify(this._xmlObj.Root.command.User.id);
        let capacity =this._xmlObj.Root.command.User.in_capacity ;
        if (typeof capacity === 'string'){
            optionsSaved.capacity=capacity;
        }
        else if (typeof capacity === 'object'){
            if (capacity.hasOwnProperty('__text')){
                optionsSaved.capacity='1';
            }
            else{
                 throw new XmlError('capacity error')
            }

        }

        let groups;
        if(!this._xmlObj.Root.command.User.groups.hasOwnProperty('group')){
           optionsSaved.groups['All']=true;
        }
        else{
            groups= this._xmlObj.Root.command.User.groups.group;
            if(groups.splice){
                groups.forEach((element)=>{
                    optionsSaved.groups[element.name]=JSON.parse(element.enabled)
                })

            }

        }


    }

    catch (e){
        throw e
    }
    return optionsSaved
};

ParseXml.prototype.resultEdit=function () {
    let result;
    try {
        result= JSON.parse(this._xmlObj.Root.command.item.result);

       
    }
    catch (e){
        throw e
    }
    return result;
};

module.exports = ParseXml;

/*
rtuget(req).then(d=> new ParseXml(d).parseRtuResponse().getGroupsAndCapacity())
    .then(log=>console.dir(log))
    .catch(e=>console.log(e.message, e.name))
*/


/*
let test_group={
    "All":true,
    "SetFwd":true,
    "Forward":true,
    "Transfer":true,


};
*!/

*/
