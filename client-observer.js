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
     endpointMustExist: false,
 };
// Observador personalizado para recibir actualizaciones de datos
class DataObserver {
  constructor() {
    this.subscription = null;
  }
  // Método para suscribirse a actualizaciones de datos
  subscribe(nodeId, session) {
    const subscriptionOptions = {
      requestedPublishingInterval: 1000, // Intervalo de publicación en milisegundos
      requestedLifetimeCount: 10,
      requestedMaxKeepAliveCount: 2,
      maxNotificationsPerPublish: 10,
      publishingEnabled: true,
      priority: 10
    };

    this.subscription = ClientSubscription.create(session, subscriptionOptions);

    this.subscription.on("started", () => {
        console.log("Subscription started");
      })
      .on("keepalive", () => {
        console.log("Subscription keep-alive");
      })
      .on("terminated", () => {
        console.log("Subscription terminated");
      })

    const itemToMonitor = {
        nodeId: nodeId,
        attributeId: AttributeIds.Value
    };
    const parameters = {
        samplingInterval: 100,
        discardOldest: false,
        queueSize: 10
    };
    
    const monitoredItem  = ClientMonitoredItem.create(
        this.subscription,
        itemToMonitor,
        parameters,
        TimestampsToReturn.Both
    );
    
    monitoredItem.on("changed", (dataValue) => {
       console.log(" value has changed : ", dataValue.value.toString());
    });

  }

  // Método para cancelar la suscripción
  unsubscribe() {
    if (this.subscription) {
      this.subscription.terminate();
    }
  }
}

// Ejemplo de uso del patrón Observer
async function main() {
  const plcEndpointUrl = "opc.tcp://localhost:4334/UA/MyLittleServer";
  const nodeId = "ns=1;s=MyVariable1";

  const client = OPCUAClient.create(options);

  const observer = new DataObserver();

  try {
    await client.connect(plcEndpointUrl);
    const session = await client.createSession();

    const nodeToRead = {
        nodeId: "ns=1;s=MyVariable1",
        attributeId: AttributeIds.Value
      };
      const dataValue =  await session.read(nodeToRead, 0);
      console.log(" value :::" , dataValue.toString());


    observer.subscribe(nodeId, session);

    // Esperar 10 segundos para recibir actualizaciones
    await new Promise((resolve) => setTimeout(resolve, 10000));

    observer.unsubscribe();
    await session.close();
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.disconnect();
  }
}

main().catch(console.error);
