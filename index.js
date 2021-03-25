var express = require('express');
var http = require('http');
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

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const server = http.createServer(app);
server.listen(process.env.PORT || 8081, () => {
    console.log(`Started server on port ${server.address().port}`);
});

// starting index
app.locals.index = 100000000000;

var clients = {};
var channels = {};


app.get('/', (req, res) => {
    console.log("app.get('/'")
    app.locals.index++;
    let id = app.locals.index.toString(36);
    res.redirect(`/${id}`);
});


app.get('/connect', (req,res) => {
    console.log("app.get('/connect'")
    if (req.headers.accept !== 'text/event-stream') {
        return res.sendStatus(404);
    }
    // write the event stream headers
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.write("event: " + "open\n\n")

    // setup a client

    var decode = jwt.verify(req.query.token, process.env.TOKEN_SECRET);

    let client = {
        id: decode.id,
        user: decode.username,
        emit: (event, data) => {
            console.log("im emmit")
            res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\nid: ${uuid.v4()}\n\n`)
            //res.write("id: " + uuid.v4() + "\n\n");
            //res.write("event: " + event + "\n\n");
            //res.write("data: " + JSON.stringify(data) + "\n\n");
        }
    };

    clients[client.id] = client;
    req.on('close', () => {
        disconnected(client);
    });
   
});

app.post('/access', (req, res) => {
    console.log("app.post('/access'")
    if (!req.body.username) {
        return res.sendStatus(403);
    }
    const user = {
        id: uuid.v4(),
        username: req.body.username
    };
    const token = jwt.sign(user,process.env.TOKEN_SECRET,{  expiresIn: '3600s' });
    console.log(token)
    return res.json(token);
});


app.get('/:roomId', (req, res) => {
    console.log("app.get('/:roomId'")
    res.sendFile(path.join(__dirname, 'resources/html/index.html'));
});


app.post('/:roomId/join', auth, (req, res) => {
    console.log("app.post('/:roomId/join'")
    let roomId = req.params.roomId;
    clients[req.user.id]["roomId"] = roomId
    console.log("Channels: ")
    console.log(channels)
    for (let peerId in channels) {
        
        console.log("links: ")
        console.log((channels[peerId]))
        console.log("Rechts: ")
        console.log(clients[req.user.id])
        if ((channels[peerId]) && clients[req.user.id]) {
            console.log("connection")

            console.log("clients: ")
            console.log(clients)

            //user der joined
            console.log("User der Joined")
            clients[req.user.id].emit('add-peer', { roomId, offer: true, peer: req.user, control: 1 });

            console.log(channels[roomId])

            Object.keys(channels[roomId]).forEach(function(key,index) {
                
                clients[key].emit('add-peer', {  roomId, offer: false, peer: req.user, control: 2 });
                // key: the name of the object key
                // index: the ordinal position of the key within the object 
            });
        }
    }
    let roomUser = {}
    roomUser[req.user.id] = {}
    roomUser[req.user.id] = true
    channels[roomId] = {}
    channels[roomId] = roomUser
    return res.sendStatus(200);
});

app.post('/relay/:peerId/:event', auth, (req, res) => {
    console.log('/relay/:peerId/:event')
    console.log("event: ")
    console.log(req.params.event)
    console.log("req: ")
    //console.log(req.body)
    let peerId = req.params.peerId;
    console.log(req.body.type)
    console.log(clients)
    console.log("peerID: ")
    console.log(peerId)
    Object.keys(clients).forEach(function(key) {
        if (clients[key].roomId == peerId) {
            console.log("true")
            clients[key].emit(req.params.event, { peer: req.user, data: req.body });    
        }
    }); 
    /*
    clients.forEach(function(item){
        console.log("im foreach block")
        if (item.roomId == peerId) {
            item.emit(req.params.event, { peer: req.user, data: req.body });    
        }
    });

    
    if (clients[peerId]) {

        clients[peerId].emit(req.params.event, { peer: req.user, data: req.body });
    }*/
    return res.sendStatus(200);
});

function disconnected(client) {
    delete clients[client.id];
    for (let roomId in channels) {
        let channel = channels[roomId];
        if (channel[client.id]) {
            for (let peerId in channel) {
                console.log("RemoveChannelPeriod:")
                console.log(channel[peerId])
                channel[peerId].emit('remove-peer', { peer: client.user, roomId });
            }
            delete channel[client.id];
        }
        if (Object.keys(channel).length === 0) {
            delete channels[roomId];
        }
    }
}

function auth(req, res, next) {
    console.log("auth function")
    let token;
    if (req.headers.authorization) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.query.token) {
        token = req.query.token;
    }
    if (typeof token !== 'string') {
        return res.sendStatus(401);
    }

    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.sendStatus(403);
        }
        req.user = user;
        next();
    });
}




