"use strict";
const X2JS = require('x2js');
const  XmlError =require('./XmlError');


function preParse(xml) {
    if (typeof xml !== 'string') {
        throw new XmlError('xml not string');
    }
    else if (xml.search("xml") === -1) {
        throw new XmlError('xml not valid');
    }
    let x2js = new X2JS();
    let xmlObj;
    try {
        xmlObj = x2js.xml2js(xml);
    }
    catch (e) {
        throw new XmlError(`${e} on preParse`);
    }
    if (!xmlObj.hasOwnProperty('Root')) {
        throw new XmlError(`not Root node on xml`);
    }
    xmlObj = xmlObj.Root;
    if (xmlObj.hasOwnProperty('Errors')) {
        let err = xmlObj.Errors.error._reason;
        throw new XmlError(`Document error[${err}]`);
    }
    if (xmlObj.hasOwnProperty('command')
        && xmlObj.command.hasOwnProperty('item')
        && xmlObj.command.item.hasOwnProperty('reason')
        && xmlObj.command.item.reason.hasOwnProperty('error')) {
        let err = xmlObj.command.item.reason.error;
        throw new XmlError(`Document error[${err}]`, 404);

    }
    return xmlObj;
}


class ParseRtuXml {
    static getGroupsAndCapacity(xml) {
        return new Promise((resolve, reject) => {
            let xmlObj = preParse(xml);
            let optionsSaved = {};
            optionsSaved.groups = {};
            try {
                optionsSaved.id = +xmlObj.command.User.id;
                let capacity = xmlObj.command.User.in_capacity;
                if (typeof capacity === 'string') {
                    optionsSaved.capacity = +capacity;
                }
                else if (typeof capacity === 'object') {
                    if (capacity.hasOwnProperty('__text')) {
                        optionsSaved.capacity = 1;
                    }
                    else {
                        reject(new XmlError('capacity error'))
                    }

                }
                let groups;
                if (!xmlObj.command.User.groups.hasOwnProperty('group')) {
                    optionsSaved.groups['All'] = false;

                }
                else {
                    groups = xmlObj.command.User.groups.group;
                     if (groups.hasOwnProperty('name')) {
                        optionsSaved.groups[groups.name]=JSON.parse(groups.enabled);

                    }
                    if (groups.splice) {
                        groups.forEach((element) => {
                            optionsSaved.groups[element.name] = JSON.parse(element.enabled)
                        })
                    }


                }
            }
            catch (e) {
                reject(new XmlError(`Not known Error [${e}] on getGroupsAndCapacity`))

            }
            resolve(optionsSaved);
        })
    }

    static UserEditResult(xml){
        return new Promise((resolve, reject) => {
            let xmlObj = preParse(xml);
            let result;
            try {
                result = JSON.parse(xmlObj.command.item.result);
                if (!result) {
                    reject(new XmlError('result false on UserEditResultParse'));
                }

            }

            catch (e) {
                reject(new XmlError(`${e} on UserEditResultParse `))
            }
            resolve(result);
        });


    }

}
module.exports=ParseRtuXml;


