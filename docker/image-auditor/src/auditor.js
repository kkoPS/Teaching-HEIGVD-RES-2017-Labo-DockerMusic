/* auditor.js
 *
 * Auditor listens to UDP packets and update an array of musicians.
 * The update is to add new musicians and to delete old ones (no packet recived for 5 seconds)
 * the JSON payloads received  are should be formatted like this :
 * { uuid: <RFC4122 uid>, sound: <see table in musician.js>, activeSince: <ISO 24chars>}
 *
 * to run : node auditor.js
 */

// include the auditor-protocol.js file. TODO : use only one file for musician.js and this file.
var protocol = require('./auditor-protocol');


// the REVERSE association map between instruments and their sounds
var sounds = new Map();
sounds.set("ti-ta-ti", "piano");
sounds.set("pouet", "trumpet");
sounds.set("trulu", "flute");
sounds.set("gzi-gzi", "violin");
sounds.set("boum-boum", "drum");

var maxWaitSeconds = 5;


// module for UDP (standard Node.js)
var dgram = require('dgram');


// tcp server
var net = require('net');


/*
 * Let's create a datagram socket. We will use it to listen for datagrams published in the
 * multicast group by musicians and containing sounds
 */
var s = dgram.createSocket('udp4');
s.bind(protocol.PROTOCOL_PORT_MUSICIANS, function() {
    console.log("Joining multicast group");
    s.addMembership(protocol.PROTOCOL_MULTICAST_ADDRESS);
});




var soundsPlaying = [];



/*
 * This call back is invoked when a new datagram has arrived.
 */
s.on('message', function(msg, source) {
    console.log("Data has arrived: " + msg + ". Source port: " + source.port);

    // we fetch the soundPlayed
    var soundReceived = JSON.parse(msg);
    var soundAlreadyExists = false;

    // we check every sound playing to update the array
    var i;
    for (i = 0 ; i < soundsPlaying.length; ++i) {
        // sound already exists : update the timestamp
        if (soundReceived.uuid === soundsPlaying[i].uuid) {
            soundsPlaying[i].lastPlay = new Date();
            soundAlreadyExists = true;
            break;
        }

    }

    // if not found
    if (!soundAlreadyExists) {
        // add into array
        soundReceived.lastPlay = new Date();
        soundReceived.instrument = sounds.get(soundReceived.sound); // get the instrument name from sound
        soundsPlaying.push(soundReceived);
        console.log("new sound listened : " + JSON.stringify(soundReceived));
    }
});

var server = net.createServer(function (socket) {
    console.log("CREATING SERVER IN AUDITOR");

    soundsPlaying = soundsPlaying.filter(function(soundPlayed){
        var interval = new Date().getTime() - soundPlayed.lastPlay.getTime();
        var intINSeconds = interval / 1000;
        var timeSinceLastPlay = Math.abs(intINSeconds);
        return timeSinceLastPlay <= maxWaitSeconds;
    });


    // send array of musicians
    socket.write(JSON.stringify(soundsPlaying.map(function (soundPlayed) {
        return {"uuid" : soundPlayed.uuid, "instrument" : soundPlayed.instrument, "activeSince" : soundPlayed.activeSince };
    })) + "\r\n");
    //socket.pipe(socket);
    socket.end();

});

// server is listening
server.listen(protocol.PROTOCOL_PORT, '0.0.0.0');

//docker run -p 2000:2205 imageName
// docker attach <nom_conteneur>