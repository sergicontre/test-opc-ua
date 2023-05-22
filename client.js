const {
    OPCUAClient,
    MessageSecurityMode, SecurityPolicy,
    AttributeIds,
    makeBrowsePath,
    ClientSubscription,
    TimestampsToReturn,
    MonitoringParametersOptions,
    ReadValueIdLike,
    ClientMonitoredItem,
    DataValue
 } = require("node-opcua-client");
 
 const connectionStrategy = {
     initialDelay: 1000,
     maxRetry: 1
 };
 const options = {
     applicationName: "MyClient",
     connectionStrategy: connectionStrategy,
     securityMode: MessageSecurityMode.None,
     securityPolicy: SecurityPolicy.None,
     endpoint_must_exist: false,
 };
 const client = OPCUAClient.create(options);
 const endpointUrl = "opc.tcp://localhost:4334/UA/MyLittleServer";
 
 async function main() {
    try {
        // step 1: connect to the server's endpoint
        await client.connect(endpointUrl);
        console.log("Connected to the OPC-UA server.");

        // step 2: create and start a new session on the server
        const session = await client.createSession();
        console.log("Session started.");

        // step 3: browse the RootFolder objects
        const browseResult = await session.browse("RootFolder");
        console.log("Browsing root folder:");
        for (let reference of browseResult.references) {
            console.log(reference.browseName.toString(), reference.nodeId.toString());
        }

        // step 4: read the variables

        // read MyVariable1
        const dataValue1 = await session.readVariableValue("ns=1;s=MyVariable1");
        console.log("Value of MyVariable1: ", dataValue1.value.toString());

        // read MyVariable2
        const dataValue2 = await session.readVariableValue("ns=1;b=1020FFAA");
        console.log("Value of MyVariable2: ", dataValue2.value.toString());

        // read FreeMemory
        const dataValue3 = await session.readVariableValue("ns=1;s=free_memory");
        console.log("Value of FreeMemory: ", dataValue3.value.toString());

        // step 5: close session
        await session.close();

        // step 6: disconnect from the server
        await client.disconnect();
        console.log("Disconnected from the server.");

    } catch (err) {
        console.error("An error has occurred: ", err);
    }
 }
 
 main();
 