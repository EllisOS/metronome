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

    // create pattterns
    createPatterns();

    aPhrase = new p5.Phrase('aa', function(time) {
        aa.play(time);
    }, aPat);
    bPhrase = new p5.Phrase('bb', function(time) {
        bb.play(time);
    }, bPat);
    
    drums = new p5.Part();

    drums.setBPM(tempoSld.value()/2);

    drums.addPhrase(aPhrase);
    drums.addPhrase(bPhrase);

}

function beatsBtn() {
    console.log('okay ' + this.value());
}

function subDivSldCalc() {
    console.log();
}

function draw() {

    background(255,0,0);
    beatsVal = numBeatsSld.value();
    subDVal = pow(2,subDivSld.value());
    tempoVal = tempoSld.value();

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

    if (subDVal <= 4) {

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

    } else {

        console.log('eighths and above');

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

        while (beatsVal < aPat.length) {
            aPat.pop();
            bPat.pop();
        }
    }

    
    
    
    // for (let i = 0; i < 2*beatsVal; i++) {
    //     if (i === 0) {
    //         aPat[i] = 1;
    //         bPat[i] = 0;
    //     } else if (i % 2 == 0) {
    //         aPat[i] = 0;
    //         bPat[i] = 1;
    //     } else {
    //         aPat[i] = 0;
    //         bPat[i] = 0;
    //     }
    // }

    console.log(aPat);
    console.log(bPat);
}

function checkBPM() { // do we need this??
    console.log('checking BPM');

}

function togglePlay() {
    console.log(beatsVal);
    console.log(subDVal);
    console.log(tempoVal);
    
    createPatterns();
    checkBPM();
    
    if (aa.isLoaded() && bb.isLoaded()) {
        if (!drums.isPlaying) {
            drums.metro.metroTicks = 0;
            drums.loop();
        } else {
            drums.stop(); // works like a pause button
        }
    } else {
        console.log('hold on a sec')
    }
}
