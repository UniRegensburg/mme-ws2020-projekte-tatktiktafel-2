var express = require('express');
var http = require('http');
var ws = require('ws');
var uuid = require('uuid');
const path = require('path');
var jwt = require('jsonwebtoken');
var bodyParser = require('body-parser');
var dotenv = require('dotenv');

const { env } = require('process');
// https://www.twilio.com/blog/working-with-environment-variables-in-node-js-html
dotenv.config();

const app = express();
app.use('/resources', express.static(`${__dirname}/resources`));
app.use('/favicon.ico', express.static('${__dirname}/resources/img/gun_PEa_icon.ico'));
app.locals.connections = [];
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const server = http.createServer(app);
const wss = new ws.Server({ server });

app.locals.index = 100000000000;

var clients = {};
var channels = {};

function broadcastConnections() {
    let ids = app.locals.connections.map(c => c._connId);
    app.locals.connections.forEach(c => {
        c.send(JSON.stringify({ type: 'ids', ids }));
    });
}

console.log("hier")

wss.on('connection', (ws) => {
    app.locals.connections.push(ws);
    ws._connId = `conn-${uuid.v4()}`;

    // send the local id for the connection
    ws.send(JSON.stringify({ type: 'connection', id: ws._connId }));

    // send the list of connection ids
    broadcastConnections();

    ws.on('close', () => {
        let index = app.locals.connections.indexOf(ws);
        app.locals.connections.splice(index, 1);

        // send the list of connection ids
        broadcastConnections();
    });

    ws.on('message', (message) => {
        for (let i = 0; i < app.locals.connections.length; i++) {
            if (app.locals.connections[i] !== ws) {
                app.locals.connections[i].send(message);
            }
        }
    });

});


/*app.get('/', (req, res) => {
    //res.sendFile(path.join(__dirname, 'index.html'));
    console.log("afterglow")
    res.sendFile(path.join(__dirname, 'resources/html/index.html'));
});*/


app.get('/', (req, res) => {
    console.log("app.get('/'")
    app.locals.index++;
    let id = app.locals.index.toString(36);
    res.redirect(`/${id}`);
});

app.get('/:roomId', (req, res) => {
    console.log("app.get('/:roomId'")
    res.sendFile(path.join(__dirname, 'resources/html/index.html'));
});


server.listen(process.env.PORT || 8081, () => {
    console.log(`Started server on port ${server.address().port}`);
});
