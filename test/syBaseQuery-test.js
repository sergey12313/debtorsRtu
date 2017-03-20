'use strict';

const chai =require('chai');
const syBaseQuery=require('../lib/sybase-query');
chai.should();
const expect = chai.expect;


describe('Sybase connect Test', ()=>{
    it(' sybase returns array ',()=>{
        return syBaseQuery().then(resolve=>{
            console.log(resolve.length);
          expect(resolve).to.be.a('array');
        })

    });
});