/**
 * Created by sergey on 09.03.17.
 */
"use strict";
//const assert = require('assert');
const chai =require('chai');

//var chaiAsPromised = require("chai-as-promised");
const rtuRequest= require('../modules/RtuHttpRequest');
const XmlStringGen=require("../modules/xmlStringGen");
chai.should();
let xmlForTestsNumbers={};

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

