const X2JS = require("x2js");
const RtuXmlError = require("./RTU-xml-error");

const preParse = xml => {
  if (typeof xml !== "string") throw new TypeError("arg xml is not string");
  const x2js = new X2JS();
  const xmlObj = x2js.xml2js(xml);
  if (!xmlObj.hasOwnProperty("Root")) {
    throw new TypeError("not Root node on xml");
  }
  const { Root: root } = xmlObj;
  if (
    root.hasOwnProperty("command") &&
    root.command.hasOwnProperty("item") &&
    root.command.item.hasOwnProperty("reason") &&
    root.command.item.reason.hasOwnProperty("error")
  ) {
    const err = root.command.item.reason.error;
    if (err.indexOf("not found") !== -1) {
      throw new RtuXmlError(err.message, 404);
    }
    throw new RtuXmlError(err.message, 500);
  }
  if (root.hasOwnProperty("Errors")) {
    let err = root.Errors.error._reason;
    throw new RtuXmlError(err.message, 500);
  }
  return root;
};

const parseRtuXmlGet = async xml => {
  const root = preParse(xml);
  const optionsSaved = {};
  optionsSaved.groups = {};
  optionsSaved.found = true;
  try {
    optionsSaved.number = +root.command.User.id;
    let capacity = root.command.User.in_capacity;
    if (typeof capacity === "string") {
      optionsSaved.capacity = +capacity;
    } else if (typeof capacity === "object") {
      if (capacity.hasOwnProperty("__text")) {
        optionsSaved.capacity = 1;
      } else {
        throw new RtuXmlError("capacity error");
      }
    }
    let groups;
    if (!root.command.User.groups.hasOwnProperty("group")) {
      optionsSaved.groups["All"] = false;
    } else {
      groups = root.command.User.groups.group;
      if (groups.hasOwnProperty("name")) {
        optionsSaved.groups[groups.name] = JSON.parse(groups.enabled);
      }
      if (groups.splice) {
        groups.forEach(element => {
          optionsSaved.groups[element.name] = JSON.parse(element.enabled);
        });
      }
    }
  } catch (e) {
    throw new RtuXmlError("getGroupsAndCapacity error");
  }
  return optionsSaved;
};
const parseRtuXmlSet = xml => {
  const root = preParse(xml);

  let result;
  try {
    result = JSON.parse(root.command.item.result);
    if (!result) {
      throw new RtuXmlError("result false on parseRtuXmlSet");
    }
  } catch (e) {
    throw new RtuXmlError(`${e} on UserEditResultParse `);
  }
  return result;
};

module.exports = {
  parseRtuXmlGet,
  parseRtuXmlSet
};
