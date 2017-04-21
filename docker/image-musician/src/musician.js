/* musician.js
 *
 * When the app is started, it is assigned an instrument.
 * This app simulates a musician who plays an instrument emitting a sound every second.
 * The sound depends on the instrument (of course).
 * The sound is emitted via UDP to a multicast group.
 * The musician has an uuid.
 * The musician has a activeSince string.
 *
 * Instrument 	Sound
 * -----------|--------
 * piano 	ti-ta-ti
 * trumpet 	pouet
 * flute 	trulu
 * violin 	gzi-gzi
 * drum 	boum-boum
 *
 */

// include of the protocol.js file
var protocol = require('./protocol');


// the association map between intruments and their sounds
var instruments = new Map();
instruments.set("piano", "ti-ta-ti");
instruments.set("trumpet", "pouet");
instruments.set("flute", "trulu");
instruments.set("violin", "gzi-gzi");
instruments.set("drum", "boum-boum");
//var map = {"piano":"ti-ta-ti","trumpet":"pouet","flute":"trulu","violin":"gzi-gzi","drum":"boum-boum"};






// module for UDP
var dgram = require('dgram');

// socket
var socket = dgram.createSocket('udp4');
socket.bind(protocol.PROTOCOL_PORT);

// RFC4122 id
//const uuidV4 = require('uuid/V4');
var uuid = require('uuid');



// empty musician
var musician = new Object();

// fetch argument : the instrument
// http://stackoverflow.com/questions/4351521/how-do-i-pass-command-line-arguments
var requestedInstrument = process.argv[2];

//console.log(requestedInstrument);

// retrieve sound or throw error message
if (!instruments.has(requestedInstrument)) {
    throw "undefined instrument in parameters";
}

musician.sound = instruments.get(requestedInstrument);
musician.instrument = requestedInstrument;
musician.activeSince = new Date().toISOString();
musician.uuid = uuid.v4();




var payload = JSON.stringify(musician);
message = new Buffer(payload);

function emitSound() {
    socket.send(message, 0, message.length, protocol.PROTOCOL_PORT, protocol.PROTOCOL_MULTICAST_ADDRESS,
        function(err, bytes) {
        console.log("Sending payload: " + payload + " via port " + socket.address().port);
    });


}

var repeat = setInterval(emitSound, 1000);