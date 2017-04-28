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
 * inspired by slides
 *
 * the JSON payloads emitted are formatted like this :
 * { uuid: <RFC4122 uid>, sound: <see table above>, activeSince: <ISO 24chars>}
 *
 * to run : node musician.js <instrument see table above>
 */

// include of the musician-protocol.js file
var protocol = require('./musician-protocol');


// the association map between instruments and their sounds
var instruments = new Map();
instruments.set("piano", "ti-ta-ti");
instruments.set("trumpet", "pouet");
instruments.set("flute", "trulu");
instruments.set("violin", "gzi-gzi");
instruments.set("drum", "boum-boum");
//var map = {"piano":"ti-ta-ti","trumpet":"pouet","flute":"trulu","violin":"gzi-gzi","drum":"boum-boum"}



// module for UDP (standard Node.js)
var dgram = require('dgram');

// RFC4122 id
//const uuidV4 = require('uuid/V4');
var uuid = require('uuid');


// socket
var socket = dgram.createSocket('udp4');
socket.bind(protocol.PROTOCOL_PORT_MUSICIANS);


// exit thread when kill signal
process.on('SIGINT', function() {
    process.exit();
});

// =============================================================

/*
 * Let's define a javascript class for our musician. The constructor accepts
 * an instrument
 */
function Musician(instrument) {
    this.instrument = instrument;
    this.sound = instruments.get(requestedInstrument);
    this.activeSince = new Date().toISOString();
    this.uuid = uuid.v4();

    /*
     * We will simulate the sound emission on a regular basis. That is something that
     * we implement in a class method (via the prototype)
     */
    Musician.prototype.update = function() {

        /*
         * Let's create the sound emission as a dynamic javascript object,
         * add the properties (uuid, sound, timestamp)
         * and serialize the object to a JSON string
         */
        var musicianPlays = {
            uuid: this.uuid,
            sound: this.sound,
            activeSince: this.activeSince
        };
        var payload = JSON.stringify(musicianPlays);
        /*
         * Finally, let's encapsulate the payload in a UDP datagram, which we publish on
         * the multicast address. All subscribers to this address will receive the message.
         */
        var message = new Buffer(payload);
        socket.send(message, 0, message.length, protocol.PROTOCOL_PORT_MUSICIANS, protocol.PROTOCOL_MULTICAST_ADDRESS, function(err, bytes) {
            console.log("Sending payload: " + payload + " via port " + socket.address().port);
        });
    }
    /*
     * Let's take and send a measure every 1000 ms
     */
    setInterval(this.update.bind(this), 1000);
}



// fetch argument : the instrument
// http://stackoverflow.com/questions/4351521/how-do-i-pass-command-line-arguments
var requestedInstrument = process.argv[2];
// retrieve sound or throw error message
if (!instruments.has(requestedInstrument)) {
    throw "undefined instrument in parameters";
}


// create instance of musician
var m1 = new Musician(requestedInstrument);
