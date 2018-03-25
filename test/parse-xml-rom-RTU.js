const { parseRtuXmlGet, parseRtuXmlSet } = require("../lib/RTU-parse-xml");
const RtuXmlError = require("../lib/RTU-xml-error");

const { get: testDataGet, set: testDataSet } = require("./xml-test-data");

const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
chai.should();

describe("Parsing response Get user info from RTU", () => {
  it("throws an exception if it is not xml", async () => {
    await parseRtuXmlGet().should.be.rejectedWith(TypeError);
  });
  it("throws an exception is not Root Node", async () => {
    await parseRtuXmlGet(testDataGet.notRootNode).should.be.rejectedWith(
      TypeError
    );
  });
  it("throws 404 if user not found", async () => {
    try {
      await parseRtuXmlGet(testDataGet.userNotFound);
      throw new Error();
    } catch (err) {
      err.should.be.an.instanceof(RtuXmlError);
      err.should.to.have.property("code", 404);
    }
  });
  it("throw other response Error", async () => {
    try {
      await parseRtuXmlGet(testDataGet.invalidCommand);
      throw new Error();
    } catch (err) {
      err.should.be.an.instanceof(RtuXmlError);
      err.should.to.have.property("code", 500);
    }
  });
  it("parsed object from valid xml", async () => {
    const result = [
      await parseRtuXmlGet(testDataGet.userHasGroupsAndCapasyty),
      await parseRtuXmlGet(testDataGet.userNotGroups),
      await parseRtuXmlGet(testDataGet.userNotCapacity)
    ];
    result.forEach(item => {
      item.should.to.have.a.property("number").that.to.be("number");
      item.should.to.have.a.property("found").that.to.be("boolean");
      item.should.to.have.a.property("capacity").that.to.be("number");
      item.should.to.have.a.property("groups").that.to.be("object").that.is.not
        .empty;
    });
  });
});
describe("Parsing response Set user config to RTU", () => {
  it("parsed object from valid xml", async () => {
    const result = await parseRtuXmlSet(testDataSet.resultOk);
    result.should.to.be.a("boolean", true);
  });
  it("throws an exception from not valid xml", async () => {
    try {
      await parseRtuXmlSet(testDataSet.error);
      throw new Error();
    } catch (err) {
      err.should.be.an.instanceof(RtuXmlError);
    }
  });
});
