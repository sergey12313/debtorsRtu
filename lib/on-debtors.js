const rtuXmlGenerator = require("./RTU-xml-generator");
const rtuRequest = require("./rtu-http-request");
const { parseRtuXmlSet } = require("./RTU-parse-xml");

const onDebtors = async (arr, collection) => {
  if (!Array.isArray(arr))
    throw new TypeError(`arg is offDebtors not an Array`);
  if (!arr.length) return;
  for (let i = 0, length = arr.length; i < length; i += 1) {
    const currentNumber = arr[i];
    try {
      const settingsFromDb = await collection.findOne({
        number: currentNumber
      });
      const { found = false } = settingsFromDb;
      if (found) {
        const xmlSetDef = await new rtuXmlGenerator(currentNumber)
          .setGroupAndCapacity(settingsFromDb)
          .endEdit();
        const editResponse = await rtuRequest(xmlSetDef);
        const resultEditResponse = await parseRtuXmlSet(editResponse);
      }
      const result12 = await collection.deleteOne({
        number: currentNumber
      });
    } catch (err) {
      console.error(err);
    }
  }
  return true;
};

module.exports = onDebtors;
