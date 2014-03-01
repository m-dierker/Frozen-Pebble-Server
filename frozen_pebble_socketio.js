var io = require('socket.io-client');
var socket = io.connect('http://localhost:7877');

var spotify = require('spotify-node-applescript');

function initSocket() {
    socket.on('connect', function (data) {
        console.log("connected to server");

        registerEvents(socket);

        socket.on('disconnect', function () {
            console.log("disconnected from server");
        });
    });
}

function registerEvents(socket) {
    socket.on('cmd', function(dataContainer) {
        var data = JSON.parse(dataContainer['utf8Data']);

        switch(data.cmd) {
            case 'next_track':
                spotify.next();
                break;
            case 'prev_track':
                spotify.previous();
                break;
            case 'volume_down':
                spotify.volumeDown();
                break;
            case 'volume_up':
                spotify.volumeUp();
                break;
            case 'play':
                spotify.play();
                break;
            case 'pause':
                spotify.pause();
                break;
            case 'playpause':
                spotify.playPause();
                break;
            case 'rock_out_to_frozen':
                spotify.playTrack('spotify:track:0qcr5FMsEO85NAQjrlDRKo', function() {
                    setTimeout(function() {
                        spotify.jumpTo(182);
                    }, 100);
                });
                break;
        }
    });
}

function updateTrack() {
    spotify.getTrack(function(err, track) {
        if (track) {
            socket.emit('track_update', track);
        }
    });
}

function periodicUpdate() {
    updateTrack();
}

function onStartup() {
    initSocket();

    setInterval(periodicUpdate, 1000);
    periodicUpdate();
}
onStartup();

