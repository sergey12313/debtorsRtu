/**
 * Created by sergey on 09.03.17.
 */
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
    it('Подключается к РТУ и получает  xml',()=>{
        return rtuRequest('').then(result=>{
            expect(result).to.have.string('<?xml version="1.0" encoding="UTF-8"?>');
        })
    });






});

describe('Проверка Парсинга', ()=>{
    let xml={};
    for(let key in TestsNumbers){
        xml[key]=XmlStringGen(TestsNumbers[key]).getNumConfigs();
    }
    for(let key in xml)
    {
        it(`привутсвие объекта групп у ${key}`,()=>{
            return rtuRequest(xml[key]).then(result=>{
                let obj = new ParseXml(result).getGroupsAndCapacity();
                //console.log(obj);
                expect(obj).to.have.property('groups')
                    .that.is.an('object')
                    .to.be.not.empty;
                expect(obj).to.have.property('capacity');


            })
        });
        it(`привутсвие capacity у ${key}`,()=>{
            return rtuRequest(xml[key]).then(result=>{
                let obj = new ParseXml(result).getGroupsAndCapacity();

                //console.log(obj);
                //expect(obj).to.have.property('capacity')
                  //  .to.satisfy(+);

            })
        });

    }

  /*  it('получение обьекта ',()=>{

        return rtuRequest('').then(result=>{
            expect(result).to.have.string('<?xml version="1.0" encoding="UTF-8"?>');
        })
    });*/






});
/*
describe('', function() {
        it('should return -1 when the value is not present', function() {
            assert.equal(-1, [1,2,3].indexOf(4));
        });
});

*/

/*
describe('Array', function() {
    describe('#indexOf()', function() {
        it('should return -1 when the value is not present', function() {
            assert.equal(-1, [1,2,3].indexOf(4));
        });
    });
});*/

