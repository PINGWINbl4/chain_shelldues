const express = require('express');
const utils = require('./utils')
const http = require('http')
const createError = require('http-errors');
const app = express()
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.post('/', async (req, res, next) => {
    res.json("chain geted")
    console.log("chain geted")
    try{
        let timer = 0
        const shelldue = req.body.shelldue
        console.log(shelldue.ShellduesChainLink)
        for (let i = 0; i < shelldue.ShellduesChainLink.length; i++) {
            timer += 50 //небольшой делей для синхронности поста в mqtt

            shelldue.ShellduesChainLink[i].action.timeout? 
                timer += shelldue.ShellduesChainLink[i].action.timeout*1000:"" //увеличение таймера, если юзер прописал таймаут

            if(shelldue.ShellduesChainLink[i].action.set){
                setTimeout(async() => {    
                    shelldue.stage = i
                    utils.updateShelldue(shelldue)
                    await utils.postToMQTT(shelldue.ShellduesChainLink[i].action)
                    const sensor = await utils.findSensorByElementId(shelldue.ShellduesChainLink[i].action.set.elementId)
                    console.log(sensor)
                    const toLog = {
                        userId: shelldue.userId,
                        stationId: sensor.stationId,
                        sensorId: sensor.id,
                        shelldueId: shelldue.id,
                        sensorName: sensor.SensorSettings.name,
                        shelldueName: shelldue.name,
                        roomName: sensor.SensorSettings.Rooms.name
                    }
                    utils.writeToLog(toLog, 1)
                },  timer);
            }
        }
        shelldue.stage = 0
        utils.updateShelldue(shelldue)
    }
    catch(err){
        console.log(err)
    }
});

app.use((req, res, next) => {
    console.log(req.url, req.ip, req.method)
    next(createError.NotFound());
});
  
app.use((err, req, res, next) => {
res.status(err.status || 500);
res.send({
    status: err.status || 500,
    message: err.message,
});
});

const PORT = process.env.APP_PORT || 5678;
const HOST = process.env.APP_HOST || "localhost"

const server = http.createServer(app);
app.listen(PORT, HOST, () => console.log(`🚀 @ http://${HOST}:${PORT}`));