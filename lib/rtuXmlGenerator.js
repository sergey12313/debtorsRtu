
const config = require ("./../configs/configs.json");
const builder = require('xmlbuilder');
const generator = require('generate-password');
const  moment = require('moment');

const { generate } = require('generate-password');
const { login, password } = config.rtu;

const DEB_GROUPS = {
   deb: true,
}
const PRETTYXML = {
    pretty: config.xml.prettyXml
};
const getOnOffString = (num, toggle) => {
    return `The number ${num} was turned ${toggle} automatically ${moment().format("lll")}`;
} 
function getXml(obj){
    return builder.create(obj,{encoding: 'utf-8'}).end(PRETTYXML);
}

class RtuXmlGenerator {
    constructor(num) {
        this.num = num;
        const authorize = {
            login,
            password,
        };
        const command = {
            '@table': 'User',
            'item': {id: this.num}
        };
        this.commandsEdit = {
            commands:{
                authorize,
                command : {
                    '@name':'Edit',
                    '@table': 'User',
                    'item': {id: this.num}
                },
            }
        };
        this.commandsGet = {
            commands:{
                authorize,
                command : {
                    '@name':'Get',
                    '@table': 'User',
                    'item': {id: this.num}
                    
                },
            }
        };
    }
    getNumConfig(num) {
        return new Promise((resolve, reject)=> {
            try {
                const xml = builder.create(this.commandsGet,{encoding: 'utf-8'}).end(PRETTYXML);
                resolve(xml);
            } catch (err) {
                reject(e)
            }
        })
    }
    setComment(comment){
        const { command } = this.commandsEdit.commands
        command.item.comment = comment;
        return this;
    }
    setGroups(groupsList) {
        const { command } = this.commandsEdit.commands
        command.item.groups = {}
        command.item.groups.group=[]
        for (const key in groupsList){
            const group = {
                name: [key],
                enabled: groupsList[key],
            }
            command.item.groups.group.push(group)
        }
        return this
    }
    setInCapacity(capacity) {
        const { command } = this.commandsEdit.commands
        command.item.in_capacity = capacity;
        return this;
    }
    setDeb() {
        this.setGroupAndCapacity({
            groups: DEB_GROUPS,
            capacity: 0
        }).setComment(getOnOffString(this.num, 'off')).
        setWebPassword();
        return this;
    }
    setGroupAndCapacity(obj){
        this.setGroups(obj.groups).setInCapacity(obj.capacity)
        .setComment(getOnOffString(this.num, 'on'))
        .setWebPassword();
        return this;
    }
    setWebPassword(password = generate({ length: 8, numbers: true })) {
        const { command } = this.commandsEdit.commands;
        command.item.web_password = password;
        return this
    }
    endEdit() {
        return new Promise((resolve, reject)=> {
            try {
                const xml = builder.create(this.commandsEdit,{encoding: 'utf-8'}).end(PRETTYXML);
                resolve(xml);
            } catch (err) {
                reject(e)
            }
        })
    }

}
module.exports = RtuXmlGenerator; 
const tmp = { groups:
    { Transfer: true,
      SetFwd: true,
      QueryFwd: true,
      All: true,
      Forward: true },
   id: 79429,
   capacity: 1 }
const x = new RtuXmlGenerator('79429')

console.dir (x.setGroupAndCapacity(tmp).endEdit())
console.log("_______________________________________________________")
console.dir (x.setDeb().endEdit());
console.log("_______________________________________________________")
console.dir (x.getNumConfig())
