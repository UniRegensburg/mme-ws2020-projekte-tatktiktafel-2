var context = {
    username: 'user' + parseInt(Math.random() * 100000),
    roomId: window.location.pathname.substr(1),
    token: null,
    eventSource: null,
    peers: [],
    channels: [],
    test: {}
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
    context.eventSource.addEventListener('error', e => {
        if (e.readyState === EventSource.CLOSED) {
         console.log('Connection was closed! ', e);
        } else {
         console.log('An unknown error occurred: ', e);
        }
       }, false);
}

const rtcConfig = {
    iceServers: [{
        urls: [
            'stun:stun.l.google.com:19302',
            'stun:stun1.l.google.com:19302'
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
        console.log('Created local peer connection object pc1');
        //peer.addEventListener('icecandidate', e => onIceCandidate(peer, e));
        console.log("offer true")
        peer.addEventListener('iceconnectionstatechange', e => onIceStateChange(peer, e));
        // create the data channel, map peer updates
        let channel = peer.createDataChannel('updates');
        channel.onmessage = function (event) {
            onPeerData(message.peer.id, event.data);
        };
        //context.
        console.log('pc1 createOffer start');
        context.channels[message.peer.id] = channel;
        createOffer(context.roomId, peer);
        //createOffer(message.peer.id, peer);
    } else {
        console.log("offer false")
        console.log('Created remote peer connection object pc2');
        //peer.addEventListener('icecandidate', e => onIceCandidate(peer, e));
        peer.addEventListener('iceconnectionstatechange', e => onIceStateChange(peer, e));
        
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
    //data ist hier offer
    console.log("relay function")
    console.log("data: ")
    console.log(data)
    context.test = data;
    console.log(JSON.stringify(data))
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
    //let offer = await peer.createOffer();
    let offer = await peer.createOffer();
    //await onCreateOfferSuccess(offer);
    //hier simma
    await peer.setLocalDescription(offer);
    onSetLocalSuccess(peer);

    await relay(peerId, 'session-description', offer);
}

function onSetLocalSuccess(pc) {
    console.log(`${(pc)} setLocalDescription complete`);
  }

function onSetSessionDescriptionError(error) {
console.log(`Failed to set session description: ${error.toString()}`);
}
function onAddIceCandidateSuccess(pc) {
    console.log(`${(pc)} addIceCandidate success`);
  }
  
function onAddIceCandidateError(pc, error) {
console.log(`${pc} failed to add ICE Candidate: ${error.toString()}`);
}

async function onCreateOfferSuccess(desc) {

    console.log('pc2 setRemoteDescription start');
    try {
      await pc2.setRemoteDescription(desc);
      onSetRemoteSuccess(pc2);
    } catch (e) {
      onSetSessionDescriptionError();
    }
  
    console.log('pc2 createAnswer start');
    // Since the 'remote' side has no media stream we need
    // to pass in the right constraints in order for it to
    // accept the incoming offer of audio and video.
    try {
      const answer = await pc2.createAnswer();
      await onCreateAnswerSuccess(answer);
    } catch (e) {
      onCreateSessionDescriptionError(e);
    }
  }


async function sessionDescription(data) {
    console.log("sessionDescriptionOffer")
    let message = JSON.parse(data.data);
    let peer = context.peers[message.peer.id];

    let remoteDescription = new RTCSessionDescription(message.data);
    await peer.setRemoteDescription(remoteDescription);
    if (remoteDescription.type === 'offer') {
        console.log("sD offer Block")
        console.log("msg.peer.id")
        console.log(message.peer.id)
        let answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        await relay(message.peer.id, 'session-description', answer);
    }
    else if (remoteDescription.type === 'answer'){
        console.log("sD answer Block")
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

async function onIceCandidate(pc, event) {
    try {
      await (pc.addIceCandidate(event.candidate));
      onAddIceCandidateSuccess(pc);
    } catch (e) {
      onAddIceCandidateError(pc, e);
    }
    console.log(`${(pc)} ICE candidate:\n${event.candidate ? event.candidate.candidate : '(null)'}`);
  }

function onIceStateChange(pc, event) {
if (pc) {
    console.log(`${(pc)} ICE state: ${pc.iceConnectionState}`);
    console.log('ICE state change event: ', event);
}
}


connect();
