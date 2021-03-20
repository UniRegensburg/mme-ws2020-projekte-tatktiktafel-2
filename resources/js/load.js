var context = {
    username: 'user' + parseInt(Math.random() * 100000),
    roomId: window.location.pathname.substr(1),
    token: null,
    eventSource: null,
    peers: [],
    channels: []
};

async function getToken() {
    let res = await fetch('/access', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: context.username
        })
    });
    
    
    let data = await res.json();
    //let data = res.json();
    //console.log(res.json());
    //context.token = data.token;
    //console.log("Hier: " + data)
    context.token = data;
}

async function join() {
    console.log("hier2")
    return fetch(`/${context.roomId}/join`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${context.token}`
        }
    });
}

async function connect() {
    await getToken();
    context.eventSource = new EventSource(`/connect?token=${context.token}`);
    //context.eventSource = new EventSource(`/connect`);
    context.eventSource.addEventListener('add-peer', (e) => {
        console.log("add-peer")
        console.log(e)
        addPeer(e)}, false);
    context.eventSource.addEventListener('remove-peer', (e) => {
        console.log("remove-peer")
        console.log(e)
        removePeer(e)}, false);
    context.eventSource.addEventListener('session-description', (e) => {
        console.log("session-description")
        console.log(e)
        sessionDescription(e)}, false);
    context.eventSource.addEventListener('ice-candidate', (e) => {
        console.log("ice-candidate")
        console.log(e)
        iceCandidate(e)}, false);
    context.eventSource.addEventListener('open', () => {
        console.log("open")
        join();
    });

    context.eventSource.onmessage = console.log


    /*context.eventSource.addEventListener('connected', () => {
        console.log("connected")
        join();
    });
    context.eventSource.addEventListener('onopen', () => {
        console.log("onopen")
        join();
    });*/
    context.eventSource.addEventListener('error', e => {
        if (e.readyState === EventSource.CLOSED) {
         console.log('Connection was closed! ', e);
        } else {
         console.log('An unknown error occurred: ', e);
        }
       }, false);''
    //join();
    //context.eventSource = new EventSource(`/connect?token=${context.token}`);
}

const rtcConfig = {
    iceServers: [{
        urls: [
            'stun:stun.l.google.com:19302',
            'stun:global.stun.twilio.com:3478'
        ]
    }]
};



function addPeer(data) {
    console.log("addPeer")
    let message = JSON.parse(data.data);
    console.log("message: ")
    console.log(message)
    console.log("own context: ")
    console.log(context)


    //if (context.peers[message.peer.id]) {
    //    return;
    //}
    

    // setup peer connection
    let peer = new RTCPeerConnection(rtcConfig);
    //context.peers = []
    context.peers[message.peer.id] = peer;

    // handle ice candidate
    peer.onicecandidate = function (event) {
        if (event.candidate) {
            relay(message.peer.id, 'ice-candidate', event.candidate);
        }
    };

    // generate offer if required (on join, this peer will create an offer
    // to every other peer in the network, thus forming a mesh)
    if (message.offer) {
        console.log("offer true")
        // create the data channel, map peer updates
        let channel = peer.createDataChannel('updates');
        channel.onmessage = function (event) {
            onPeerData(message.peer.id, event.data);
        };
        //context.
        context.channels[message.peer.id] = channel;
        createOffer(message.peer.id, peer);
    } else {
        console.log("offer false")
        peer.ondatachannel = function (event) {
            context.channels[message.peer.id] = event.channel;
            event.channel.onmessage = function (evt) {
                onPeerData(message.peer.id, evt.data);
            };
        };
    }
}

function broadcast(data) {
    console.log("es wird data gesendet")
    for (let peerId in context.channels) {
        context.channels[peerId].send(data);
    }
}

async function relay(peerId, event, data) {
    console.log("relay function")
    await fetch(`/relay/${peerId}/${event}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${context.token}`
        },
        body: JSON.stringify(data)
    });
}

async function createOffer(peerId, peer) {
    console.log("create-offer function")
    let offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    await relay(peerId, 'session-description', offer);
}


async function sessionDescription(data) {
    console.log("sessionDescriptionOffer")
    let message = JSON.parse(data.data);
    let peer = context.peers[message.peer.id];

    let remoteDescription = new RTCSessionDescription(message.data);
    await peer.setRemoteDescription(remoteDescription);
    if (remoteDescription.type === 'offer') {
        let answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        await relay(message.peer.id, 'session-description', answer);
    }
}

function iceCandidate(data) {
    console.log("iceCandidate-function")
    //let message = data.peer;
    let message = JSON.parse(data.data);
    console.log(message)
    console.log(message.peer.id)
    let peer = context.peers[message.peer.id];
    console.log(peer)
    peer.addIceCandidate(new RTCIceCandidate(message.data));
}

function removePeer(data) {
    let message = JSON.parse(data.data);
    if (context.peers[message.peer.id]) {
        context.peers[message.peer.id].close();
    }

    delete context.peers[message.peer.id];
}


connect();
