module.exports.get = {
  notXML: "test-text",
  notRootNode: `<?xml version="1.0" encoding="UTF-8"?>
  <Root1>
    <Errors>
        <error code="301" reason="Invalid command" />
    </Errors>
  </Root1>`,
  invalidCommand: `<?xml version="1.0" encoding="UTF-8"?>
    <Root>
      <Errors>
          <error code="301" reason="Invalid command" />
      </Errors>
    </Root>`,
  userNotFound: `<?xml version="1.0" encoding="UTF-8"?>
  <Root>
      <command name="Get" table="User">
          <item>
              <result>false</result>
              <reason code="503" reason="Errors occurred while validating data">
                  <error>id: User with id '247547' was not found</error>
              </reason>
          </item>
      </command>
      <Errors>
          <error code="503" reason="Errors occurred while validating data" />
      </Errors>
  </Root>`,
  userHasGroupsAndCapasyty: `<?xml version="1.0" encoding="UTF-8"?>
  <Root>
      <command name="Get" table="User">
          <User>
              <user>24757</user>
              <id>12345</id>
             <owner_capacity>5</owner_capacity>
              <in_capacity>3</in_capacity>
              <out_capacity>3</out_capacity>
              <total_capacity>4</total_capacity>
              <groups>
                  <group>
                      <name>All</name>
                      <enabled>true</enabled>
                  </group>
                  <group>
                      <name>BlackWhiteList</name>
                      <enabled>true</enabled>
                  </group>
                  <group>
                      <name>Forward</name>
                      <enabled>true</enabled>
                  </group>
                  <group>
                      <name>Transfer</name>
                      <enabled>true</enabled>
                  </group>
                  <group>
                      <name>SetFwd</name>
                      <enabled>true</enabled>
                  </group>
              </groups>
              <packages />
          </User>
      </command>
  </Root>`,
  userNotGroups: `<?xml version="1.0" encoding="UTF-8"?>
  <Root>
      <command name="Get" table="User">
          <User>
              <user>24757</user>
              <id>12345</id>
             <owner_capacity>5</owner_capacity>
              <in_capacity>3</in_capacity>
              <out_capacity>3</out_capacity>
              <total_capacity>4</total_capacity>
              <groups />
              <packages />
          </User>
      </command>
  </Root>`,
  userNotCapacity: `<?xml version="1.0" encoding="UTF-8"?>
  <Root>
      <command name="Get" table="User">
          <User>
              <user>24757</user>
              <id>12345</id>
              <owner_capacity>
              </owner_capacity>
              <in_capacity>
              </in_capacity>
              <out_capacity>
              </out_capacity>
              <total_capacity>
              </total_capacity>
              <groups />
              <packages />
          </User>
      </command>
  </Root>`
};

module.exports.set = {
  resultOk: `<?xml version="1.0" encoding="UTF-8"?>
    <Root>
        <command name="Edit" table="User">
            <item>
                <result>true</result>
            </item>
        </command>
    </Root>`,
  error: `<?xml version="1.0" encoding="UTF-8"?>
    <Root>
        <command name="Edit" table="User">
            <item>
                <result>false</result>
                <reason code="503" reason="Errors occurred while validating data">
                    <error>id: User with id '166701' was not found</error>
                </reason>
            </item>
        </command>
        <Errors>
            <error code="503" reason="Errors occurred while validating data" />
        </Errors>
    </Root>`
};
