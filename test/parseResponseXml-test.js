"use strict";
//const assert = require('assert');
const chai =require('chai');

//var chaiAsPromised = require("chai-as-promised");
const rtuRequest= require('../modules/RtuHttpRequest');
const XmlStringGen=require("../modules/xmlStringGen");
const ParseXml=require('../modules/parseResponseXml');

chai.should();
let TestsNumbers={
    'numForReadWrite':'16666',
    'capacityEmptyAndManyGroups': '16667',
    'globalCapacity':'16668',
    'notGroups':'16669'

};

//const parseResponseXml = require('./modules/parseResponseXml');


const expect = chai.expect;

describe('Генерация xml ', ()=>{
    it('гененрирует валидный xml ',()=>{
        expect(XmlStringGen(16666).getNumConfigs()).to.have.string('<?xml version="1.0" encoding="utf-8"?>');
    });




});
describe('Get Rtu', ()=>{
    it('Подключается к РТУ и получает  xml',()=>{
        return rtuRequest('').then(result=>{
            expect(result).to.have.string('<?xml version="1.0" encoding="UTF-8"?>');
        })
    });

});

describe('Parser test', ()=>{
    let resultResponse={};
    for(let key in TestsNumbers){
        let xml=XmlStringGen(TestsNumbers[key]).getNumConfigs();
        resultResponse[key]=rtuRequest(xml);
    }
    for(let key in resultResponse)
    {
        describe(`[${key}]`, ()=>{
            it(`To have property: groups, capacity and id`,()=>{
                return resultResponse[key].then(result=>{
                    let obj = new ParseXml(result).getGroupsAndCapacity();
                    expect(obj).to.have.all.keys('groups','capacity','id');
                })
            });
            it(`Capacity сan be convert to a number`,()=>{

                return resultResponse[key].then(result=>{
                    let obj = new ParseXml(result).getGroupsAndCapacity();
                    let toNum = Number(obj.capacity);
                    expect(toNum).to.be.a('number').not.to.be.NaN;

                })
            });
            it(`Id is string `,()=>{
                return resultResponse[key].then(result=>{
                    expect(result).to.be.a('string');
                })

            })






        });



    }

});
