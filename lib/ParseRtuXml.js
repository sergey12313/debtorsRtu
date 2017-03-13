"use strict";
const X2JS = require('x2js');

class XmlError extends Error{
    constructor(message,extra){
        super();
        this.message=message;
        this.name = 'XmlParserError';
        if (extra){this.extra=extra}
    }
}

class ParseRtuXml{
    constructor(xml) {
        this._xml = xml;
        if (typeof this._xml !== 'string') {
            return Promise.reject(new XmlError('xml not string'));
        }
        else if (this._xml.search("xml") === -1) {
            return Promise.reject(new XmlError('xml not valid'))
        }
        let x2js = new X2JS();
        try {
            this._xmlObj = x2js.xml2js(this._xml);
        }
        catch (e) {
            return Promise.reject(new XmlError(`${e} on constructor ParseRtuXml`))
        }
        if (!this._xmlObj.hasOwnProperty('Root')) {
            return Promise.reject(new XmlError(`not Root node on xml`))
        }
        this._xmlObj = this._xmlObj.Root;
        if (this._xmlObj.hasOwnProperty('Errors')) {
            let err = this._xmlObj.Errors.error._reason;
            return Promise.reject(new XmlError(`Document error[${err}]`));
        }
        if (this._xmlObj.hasOwnProperty('command')
            && this._xmlObj.command.hasOwnProperty('item')
            && this._xmlObj.command.item.hasOwnProperty('reason')
            && this._xmlObj.command.item.reason.hasOwnProperty('error')) {
            let err = this._xmlObj.command.item.reason.error;
            return Promise.reject(new XmlError(`Document error[${err}]`, 404));

        }
    }

    static init(xml){
        return new ParseRtuXml(xml)
    }
    getGroupsAndCapacity(){
        return new Promise((resolve,reject)=>{
            let optionsSaved={};
            optionsSaved.groups={};
            try{
                optionsSaved.id=this._xmlObj.command.User.id;
                let capacity =this._xmlObj.command.User.in_capacity ;
                if (typeof capacity === 'string'){
                    optionsSaved.capacity=capacity;
                }
                else if (typeof capacity === 'object'){
                    if (capacity.hasOwnProperty('__text')){
                        optionsSaved.capacity='1';
                    }
                    else{
                        reject(new XmlError('capacity error'))
                    }

                }
                let groups;
                if(!this._xmlObj.command.User.groups.hasOwnProperty('group')){
                   optionsSaved.groups['All']=false;

                }
                else{
                    groups= this._xmlObj.command.User.groups.group;
                    if(groups.splice){
                        groups.forEach((element)=>{
                            optionsSaved.groups[element.name]=JSON.parse(element.enabled)
                        })
                    }
                }
            }
            catch (e){
                reject(new XmlError(`Not known Error [${e}] on getGroupsAndCapacity`))

            }
            resolve(optionsSaved);
        })
    }
    UserEditResult(){
/*        let result;
        try {
            result= JSON.parse(this._xmlObj.Root.command.item.result);


        }
        catch (e){
            throw e
        }
        return result;
        */
    }


}


module.exports = ParseRtuXml;

