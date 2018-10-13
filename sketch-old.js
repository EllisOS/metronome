var numBeatsSld; // number of beats slider
var subDivSld; // subdivision slider
var tempoSld; // tempo slider
var startStopBtn; // start/stop button
var beatsVal = 4; // defaults... 4/4 @ 120
var subDVal = 4;
var tempoVal = 60;
let aa; // container for first sound source
let aPat = []; // first sound source pattern
let aPhrase; // first sound source phrase. determines how pattern is interpreted
let bb; // second sound source
let bPat = [];
let bPhrase;
let drums; // part.  attach phrase to part, transport to drive the phrase
let bpmCTRL;
let beatLength;
let canvas;
let sPat; // index pattern
let cellWidth;

/**
 * OPEN TICKETS
 * 
 * * * make number of beats slider accurately represented when played
 * 
 * - make sure tempo updates during session as well
 * - tempo is 2x as fast as it needs to be
 */

function setup() {
    createCanvas(1920, 1080);

    // sound sources
    aa = loadSound('./assets/first_sound.wav', function() {});
    bb = loadSound('./assets/second_sound.wav', function() {});

    // number of beats slider
    numBeatsSld = createSlider(1, 20, 4);
    numBeatsSld.position(100, 150);
    numBeatsSld.style('width', '160px');

    // subdivision slider
    // 0-5 base to represent pow(2,n)
    subDivSld = createSlider(0,5,2);
    subDivSld.position(320, 150);
    subDivSld.style('width', '160px');

    // tempo slider
    tempoSld = createSlider(30,300,120);
    tempoSld.position(100, 250);
    tempoSld.style('width', '160px');
    tempoSld.input(() => {
        drums.setBPM(tempoSld.value()/2)
    });

    // start/stop button
    startStopBtn = createButton('Start/Stop');
    startStopBtn.mousePressed(togglePlay);
    startStopBtn.position(320, 250);
    startStopBtn.style('width', '160px');

    // create pattterns for the high and low sounds
    createPatterns();

    // arbitrary
    aPhrase = new p5.Phrase('aa', function(time) {
        console.log('i play every time')
        aa.play(time);
    }, aPat);
    bPhrase = new p5.Phrase('bb', function(time) {
        bb.play(time);
    }, bPat);
    
    // create main drums part
    drums = new p5.Part();

    //set tempo
    drums.setBPM(tempoSld.value()/2);

    // add two phrases to drums part
    drums.addPhrase(aPhrase);
    drums.addPhrase(bPhrase);

}

function beatsBtn() { // i don't remember why this is here
    console.log('okay ' + this.value());
}


function draw() { // this function gets called 60 times a second, arbitrarily

    background(255,0,0); // paint background
    beatsVal = numBeatsSld.value(); // tracks value of numBeats slider
    subDVal = pow(2,subDivSld.value()); // .. of subdivision
    tempoVal = tempoSld.value(); // and tempo

    text("Number of Beats", numBeatsSld.x+30,65);
    text("Base Subdivision", subDivSld.x+30,65);
    text("Tempo ", tempoSld.x+30,165);

    textSize(18);
    text(beatsVal, numBeatsSld.x+10,65);
    text(subDVal, subDivSld.x+10,65);
    text(tempoVal, tempoSld.x-10,165);
}

function createPatterns() {

    console.log(subDVal);
    console.log(beatsVal);

    // clear patterns
    aPat = [];
    bPat= [];
    
    if (subDVal <= 4) { // if quarter note or longer, quarters and eights


        // Produces 4/4 >>  1-2-3-4- pattern
        for (let i = 0; i < 2*beatsVal; i++) {
            if (i === 0) {
                aPat[i] = 1;
                bPat[i] = 0;
            } else if (i % 2 == 0) {
                aPat[i] = 0;
                bPat[i] = 1;
            } else {
                aPat[i] = 0;
                bPat[i] = 0;
            }
        }

    } else { // if less, just eighths

        console.log('eighths and above');

        // produces 1-3-5-7 in 7/8
        for (let i = 0; i < beatsVal; i++) {
            if (i === 0) {
                console.log('1');
                aPat[i] = 1;
                bPat[i] = 0;
            } else if (i % 2 == 0) {
                console.log('2');
                aPat[i] = 0;
                bPat[i] = 1;
            } else {
                console.log('3');
                aPat[i] = 0;
                bPat[i] = 0;
            }
        }

        // trim off remaining notes from default 4/4 representation
        while (beatsVal < aPat.length) {
            aPat.pop();
            bPat.pop();
        }
    }

    console.log(aPat);
    console.log(bPat);
}

function checkBPM() { // do we need this??
    console.log('checking BPM');

}

function togglePlay() {
    // console logs settings of last played setting
    console.log(beatsVal);
    console.log(subDVal);
    console.log(tempoVal);
    
    // makes sure pattern is updates
    createPatterns();
    
    checkBPM();

    // makes sure sounds are loaded before trying to play drums    
    if (aa.isLoaded() && bb.isLoaded()) {
        if (!drums.isPlaying) {
            drums.metro.metroTicks = 0; // reset loop to start 
            drums.loop();
        } else {
            drums.stop(); // works like a pause button
        }
    } else { // if sounds haven't loaded yet
        console.log('hold on a sec');
    }
}
