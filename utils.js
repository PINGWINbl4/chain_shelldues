const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function updateShelldue(shelldue){
    return await db.shelldue.update({
        where:{
            id: shelldue.id
        },
        data: {
            stage: shelldue.stage
        }
    })
}

async function findSensorByElementId(elementId){
    return await db.sensor.findFirst({
        where:{
            elementId:elementId
        },
        include:{
            Station:true
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

module.exports = {
    updateShelldue,
    postToMQTT
}