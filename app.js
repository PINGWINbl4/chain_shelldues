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
        for (let i = 0; i < shelldue.ShellduesChainLink.length; i++) {
            timer+=i*500
            shelldue.ShellduesChainLink[i].action.timeout? 
                        timer+= shelldue.ShellduesChainLink[i].action.timeout*1000:""
            if(shelldue.ShellduesChainLink[i].action.set){
                setTimeout(async() => {
                    await utils.postToMQTT(shelldue.ShellduesChainLink[i].action)
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