const rtuXmlGenerator = require("./RTU-xml-generator");
const rtuRequest = require("./RTU-http-request");
const { parseRtuXmlGet, parseRtuXmlSet } = require("./RTU-parse-xml");

const offDebtors = async (arr, collection) => {
  if (!Array.isArray(arr))
    throw new TypeError(`arg is offDebtors not an Array`);
  if (!arr.length) return;
  for (let i = 0, length = arr.length; i < length; i += 1) {
    const currentNumber = arr[i];
    const xmlGetNumConfigs = await new rtuXmlGenerator(
      currentNumber
    ).getNumConfig();
    const resNumConfigs = await rtuRequest(xmlGetNumConfigs);
    let parsedGroupAndCapacity;
    try {
      parsedGroupAndCapacity = await parseRtuXmlGet(resNumConfigs);
    } catch (err) {
      if (err.code === 404) {
        parsedGroupAndCapacity = {
          number: currentNumber,
          capacity: 0,
          found: false
        };
      } else {
        console.error(
          `${err} on offDebtors => ParseRtuXml.getGroupsAndCapacity ${currentNumber}`
        );
        continue;
      }
    }
    if (parsedGroupAndCapacity.found) {
      const xmlSetDeb = await new rtuXmlGenerator(currentNumber)
        .setDeb()
        .endEdit();
      const resSetDeb = await rtuRequest(xmlSetDeb);
      try {
        const parsedSetDebResult = await parseRtuXmlSet(resSetDeb);
      } catch (err) {
        console.error(
          `${err}  on offDebtors => ParseRtuXml.UserEditResult ${currentNumber}`
        );
        continue;
      }
    }
    try {
      await collection.insertOne(parsedGroupAndCapacity);
    } catch (err) {
      console.error(
        `${err}  on offDebtors => collection.insert ${currentNumber}`
      );
    }
  }
};

module.exports = offDebtors;
