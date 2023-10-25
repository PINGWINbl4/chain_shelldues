const express = require('express');
const utils = require('./utils')
const http = require('http')
const app = express()
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
    next(createError.NotFound());
  });
  
app.use((err, req, res, next) => {
res.status(err.status || 500);
res.send({
    status: err.status || 500,
    message: err.message,
});
});

app.post('/', async (req, res, next) => {
    const shelldue = req.body.shelldue
    switch (shelldue.chain[shelldue.stage]) {
        case "timeout":
            setTimeout(async() => {
                shelldue.stage++
                utils.updateShelldue(shelldue)
            }, shelldue.chain[shelldue.stage].timeout);
            break;
        case "set":
            
            break;
    
        default:
            break;
    }
});

const PORT = process.env.APP_PORT || 5678;
const HOST = process.env.APP_HOST || "localhost"

const server = http.createServer(app);
app.listen(PORT, HOST, () => console.log(`🚀 @ http://${HOST}:${PORT}`));