var Firebase = require('Firebase');
var firebase = new Firebase('https://frozenpebble.firebaseio.com/');

var userBase = firebase.child('users/mdierker');
var statusBase = userBase.child('desktop_status');
var trackBase = userBase.child('track');
var trackChangeBase = userBase.child('track_change');
var cmdBase = userBase.child('cmd');

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
        console.log("Updating status from client");
        statusBase.set({'desktop_status': state['state'] == 'playing'});
    });
}

function setupStatusListener() {
    statusBase.on('child_changed', function (snapshot) {
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
    trackChangeBase.on('child_changed', function(snapshot) {
        changeTrack(snapshot);
    });

    resetTrackChange();
}

function resetTrackChange() {
    trackChangeBase.set({'track': {
        'id': 0
    }});
}

function updateTrack() {
    spotify.getTrack(function(err, track) {
        if (track) {
            trackBase.set({'track': track});
        }
    });
}

function setupCmdListener() {
    cmdBase.remove();

    cmdBase.on('child_added', function(snapshot) {
        switch(snapshot.name()) {
            case 'next_track':
                spotify.next();
                break;
            case 'prev_track':
                spotify.prev();
                break;
            case 'volume_down':
                spotify.volumeDown();
                break;
            case 'volume_up':
                spotify.volumeUp();
                break;
        }
        cmdBase.remove();
    });
}