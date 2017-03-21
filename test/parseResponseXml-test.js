"use strict";

const chai =require('chai');
const rtuRequest= require('../lib/rtu-http-request');
const XmlStringGen=require("../lib/xml-string-gen");
const ParseRtuXml=require('../lib/parse-rtu-xml');
const cap = require('chai-as-promised');
const  XmlError =require('../lib/xml-error');

chai.use(cap);
chai.should();
const TestsNumbers={
    'numForReadWrite':'16666',
    'capacityEmptyAndManyGroups': '16667',
    'globalCapacityAndOneGroup':'16668',
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
                let resXml = await resultResponse[key]();
                let parsed = await ParseRtuXml.getGroupsAndCapacity(resXml);
                return  expect(parsed).to.have.all.keys('groups','capacity','id')

            });
            it(`Capacity сan be convert to a number`, async ()=>{
                let  resXml= await resultResponse[key]();
                let parsed= await ParseRtuXml.getGroupsAndCapacity(resXml);
                return expect(parsed.capacity).to.be.a('number').not.to.be.NaN;

            });
            it(`Id is string `,async ()=>{
                let resXml = await resultResponse[key]();
                let parsed= await ParseRtuXml.getGroupsAndCapacity(resXml);
                return expect(parsed.id).to.be.a('number');


            });
            it(`groups not empty object`,async ()=>{
                let resXml = await resultResponse[key]();
                let parsed= await ParseRtuXml.getGroupsAndCapacity(resXml);

                
                return expect(parsed.groups).to.be.a('object')
                    .to.be.not.empty;


            });

        });
    }
    it(`Throws the correct exception on not found user`,async ()=>{
        let xml = await XmlStringGen('16665').getNumConfigs();
        let resXml= await rtuRequest(xml);
        return expect(ParseRtuXml.getGroupsAndCapacity(resXml)).to.eventually.be.rejected
            .and.be.an.instanceOf(XmlError)
            .to.have.property('extra')
            .to.equal(404);
    });


    it(`test`,async ()=>{
        let xml = await XmlStringGen('16666').getNumConfigs();//сгенерировали xml для получения свойств номера
        let resXml=await rtuRequest(xml);                        //отправили и получили ответный xml
       // console.log(resXml,1);
        let parse = await ParseRtuXml.getGroupsAndCapacity(resXml);//распарсили в объект !!!!!!!!!!!!!!!!!!!!!
        let toDeb= await new XmlStringGen('16666').setDebNum();   //сгененрировали xml со сойсвами дебитора
        //console.log(toDeb,2);
        let toDefXml =await XmlStringGen('16666').setCapacityAndGroups(parse);///сгененрировали xml со сойсвами номера из
        //console.log(toDefXml,3);
                                        //из обьекта
        let resXmlAfter=await rtuRequest(toDefXml);
        console.log(resXmlAfter,4);
        let ParseEditNumXml= await ParseRtuXml.UserEditResult(resXmlAfter);


        // должен быть распарсен обьект
        let resAfter1=await rtuRequest(xml);
        let parseAfter = await ParseRtuXml.getGroupsAndCapacity(resAfter1);

       /* console.log(parse);
        console.log(parseAfter);*/
        return expect(parse).to.deep.equal(parseAfter);


    });





});
