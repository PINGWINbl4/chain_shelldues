const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function updateShelldue(shelldue){
    return await db.shelldue.update({
        where:{
            id: shelldue.id
        },
        data: {
            stage: shelldue.stage,
            executing: shelldue.executing
        }
    })
}

async function findSensorByElementId(elementId){
    return await db.sensor.findFirst({
        where:{
            elementId:elementId
        },
        include:{
            Station:true,
            SensorSettings:{
                include:{
                    Rooms:true
                }
            }
        }
    })
}

async function postToMQTT(link){
    console.log(link)
    const sensor = await findSensorByElementId(link.set.elementId)
    const topic = `${sensor.Station.userId}/${sensor.Station.gatewayId}/${link.set.elementId}/set`
    const postData = {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          topic: topic,
          shelldueScript: link.set
        })
      }
    fetch(`http://${process.env.SHELLDUE_HOST}:${process.env.SHELLDUE_PORT}/`, postData)
        .then(async (res) => {
        console.log(await res.json())
        })
        .catch(err => {throw new Error(err)})
}

async function writeToLog(data, code){
    try{
      const url = `http://${process.env.LOGGER_HOST || "localhost"}:${process.env.LOGGER_PORT || "5282"}/${code}` 
      const postData = {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: data
        })
      }
      console.log(postData)
      await fetch(url, postData)
      .then(console.log(`${data.shelldueName} change status. Log req sended.\n User with id:${data.userId} can see it soon`))
      .catch(err => {throw new Error(err)})
    }
    catch(err){
      console.log(err)
    }
}

module.exports = {
    updateShelldue,
    postToMQTT,
    writeToLog,
    findSensorByElementId
}