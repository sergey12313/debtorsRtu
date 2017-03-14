"use strict";

const chai =require('chai');
const rtuRequest= require('../lib/RtuHttpRequest');
const XmlStringGen=require("../lib/xmlStringGen");
const ParseRtuXml=require('../lib/ParseRtuXml');
const cap = require('chai-as-promised');
const  XmlError =require('../lib/XmlError');

chai.use(cap);
chai.should();
const TestsNumbers={
    'numForReadWrite':'16666',
    'capacityEmptyAndManyGroups': '16667',
    'globalCapacity':'16668',
    'notGroups':'16669'

};

const expect = chai.expect;

describe('Генерация xml ', ()=>{
    it('гененрирует валидный xml ',()=>{
        return XmlStringGen(16666).getNumConfigs().then(result=>{
            expect(result).to.have.string('<?xml version="1.0" encoding="utf-8"?>');
        });

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
        resultResponse[key]= async () =>{
            let xml= await XmlStringGen(TestsNumbers[key]).getNumConfigs();
            let response=await rtuRequest(xml);
            return response;
        }
    }
    for(let key in resultResponse)
    {


        describe(`[${key}]`, ()=>{
            it(`To have property: groups, capacity and id`, async ()=>{
                let req = await resultResponse[key]();
                let parseInit= await ParseRtuXml.init(req);
                let parsed = await ParseRtuXml.getGroupsAndCapacity(parseInit);
                //console.log(parsed)
                return  expect(parsed).to.have.all.keys('groups','capacity','id')

            });
            it(`Capacity сan be convert to a number`, async ()=>{
                let req = await resultResponse[key]();
                let parseInit= await ParseRtuXml.init(req);
                let parsed= await ParseRtuXml.getGroupsAndCapacity(parseInit);
                let toNum = Number(parsed.capacity);
                return expect(toNum).to.be.a('number').not.to.be.NaN;

            });
            it(`Id is string `,async ()=>{
                let req = await resultResponse[key]();
                let parseInit= await ParseRtuXml.init(req);
                let parsed= await ParseRtuXml.getGroupsAndCapacity(parseInit);
                return expect(parsed.id).to.be.a('string');


            });


            it('set Deb and return default',()=>{
                return


            })
        });
    }
    it(`Throws the correct exception on not found user`,async ()=>{
        let xml = await XmlStringGen('16665').getNumConfigs();
        let req=await rtuRequest(xml);
        return expect(ParseRtuXml.init(req)).to.eventually.be.rejected
            .and.be.an.instanceOf(XmlError)
            .to.have.property('extra')
            .to.equal(404);
    });



});
