
/*global require,setInterval,console */
const opcua = require("node-opcua");

// Let's create an instance of OPCUAServer
const server = new opcua.OPCUAServer({
    port: 4334, // the port of the listening socket of the server
    resourcePath: "/UA/MyLittleServer", // this path will be added to the endpoint resource name
     buildInfo : {
        productName: "MySampleServer1",
        buildNumber: "7658",
        buildDate: new Date(2014,5,2)
    }
});

function post_initialize() {
    console.log("initialized");
    function construct_my_address_space(server) {
    
        const addressSpace = server.engine.addressSpace;
        const namespace = addressSpace.getOwnNamespace();
    
        // declare a new object
        const device = namespace.addObject({
            organizedBy: addressSpace.rootFolder.objects,
            browseName: "MyDevice"
        });
    
        // add some variables
        // add a variable named MyVariable1 to the newly created folder "MyDevice"
        let variable1 = 1;
        
        // emulate variable1 changing every 500 ms
        setInterval(function(){  variable1+=1; }, 500);
        
        namespace.addVariable({
            componentOf: device,
            browseName: "MyVariable1",
            nodeId: "ns=1;s=MyVariable1",
            dataType: "Double",
            value: new opcua.Variant({ dataType: opcua.DataType.Double, value: 0 })
        });

        // Simulate data changes
        setInterval(() => {
            // Get the default namespace
            const addressSpace = server.engine.addressSpace;
            const namespace = addressSpace.getOwnNamespace();

            // Get the variable node

             // Get the variable from the namespace
            const foundVariable = namespace.findNode("ns=1;s=MyVariable1");
            // Generate a random value
            const value = Math.random() * 100;
            // Set the value of the variable
            foundVariable.setValueFromSource(new opcua.Variant({ dataType: "Double", value: value }));

            console.log("Data changed:", value);
        }, 1000); // Change data every 1 second

    }
    construct_my_address_space(server);
    server.start(function() {
        console.log("Server is now listening ... ( press CTRL+C to stop)");
        console.log("port ", server.endpoints[0].port);
        const endpointUrl = server.endpoints[0].endpointDescriptions()[0].endpointUrl;
        console.log(" the primary server endpoint url is ", endpointUrl );
    });
}
server.initialize(post_initialize);

