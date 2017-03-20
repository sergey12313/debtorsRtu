'use strict';
class XmlError extends Error{
    constructor(message,extra){
        super();
        this.message=message;
        this.name = 'XmlParserError';
        if (extra){this.extra=extra}
    }
}
module.exports=XmlError;