
import kafka from "./client";

async function init(){
    const admin = kafka.admin();
    console.log('Connecting...')
    admin.connect()
    console.log('Connected!')

    console.log('Creating topic')
    await admin.createTopics({
        topics: [
            { topic: 'realtime-fetch', numPartitions: 2 }
        ]
    })
    console.log('Topic created success');

    
    console.log('Creating topic')
    await  admin.disconnect()
}

init()