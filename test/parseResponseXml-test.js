/**
 * Created by sergey on 09.03.17.
 */
"use strict";
//const assert = require('assert');
const chai =require('chai');

//var chaiAsPromised = require("chai-as-promised");
const rtuRequest= require('../modules/RtuRequest');
const xmlStringGen=('../modules/xmlStringGen')
chai.should();
let xmlForTestsNumbers={};

//const parseResponseXml = require('./modules/parseResponseXml');
//chai.use(chaiAsPromised);

const expect = chai.expect;

describe('Генерация xml ', ()=>{
    it('гененрирует валидный xml ',()=>{
        expect(xmlStringGen('16666')).to.have.string('<command name=1');
    });



});

describe('Get Rtu', ()=>{
    it('Подключается к РТУ и получает  xml',()=>{
        return rtuget('').then(result=>{
            expect(result).to.have.string('<command name=');

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

