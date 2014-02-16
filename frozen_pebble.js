var Firebase = require('Firebase');
var firebase = new Firebase('https://frozenpebble.firebaseio.com/');

var userBase = firebase.child('users/mdierker');
var trackBase = userBase.child('track');
var trackSetBase = userBase.child('track_set');

var spotify = require('spotify-node-applescript');


function onStartup() {

    setInterval(periodicUpdate, 1000);
    periodicUpdate();

    setupStatusListener();
    setupTrackListener();
    setupCmdListener();
}
onStartup();

function periodicUpdate() {
    updateTrack();
    updatePlayingStatusFromClient();
}

function updatePlayingStatusFromClient() {
    spotify.getState(function(err, state) {
        if (err) { return; }
        userBase.update({'desktop_status': state['state'] == 'playing'});
    });
}

function setupStatusListener() {
    userBase.on('child_changed', function (snapshot) {
        if (snapshot.name() == 'desktop_status') {
            console.log("playing or pausing");
            if (snapshot.val()) {
                spotify.play();
            } else {
                spotify.pause();
            }
        }
    });
}

function changeTrack(snapshot) {
    if (snapshot.name() == 'track') {
        var track = snapshot.val();
        spotify.playTrack(track['id'], function() {
            resetTrackChange();
        });
    }
}
function setupTrackListener() {
    trackSetBase.on('child_changed', function(snapshot) {
        changeTrack(snapshot);
    });

    resetTrackChange();
}

function resetTrackChange() {
    trackSetBase.set({'track': {
        'id': 0
    }});
}

function updateTrack() {
    spotify.getTrack(function(err, track) {
        if (track) {
            trackBase.set(track);
        }
    });
}

function setupCmdListener() {
    userBase.update({'cmd': null});

    userBase.on('child_added', function(snapshot) {
        if (snapshot.name() == 'cmd') {
            switch(snapshot.val()) {
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
            userBase.update({'cmd': null});
        }
    });
}