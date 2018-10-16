let numBeatsSld; // number of beats slider
let subDivSld; // subdivision slider
let tempoSld; // tempo slider
let startStopBtn; // start/stop button
let resetBtn; // reset button
let recordBtn; // record button
let beatsVal = 4; // defaults... 4/4 @ 120
let subDVal = 4;
let tempoVal = 60;
let aa; // container for first sound source
let aPat = []; // first sound source pattern
let aPhrase; // first sound source phrase. determines how pattern is interpreted
let bb; // second sound source
let bPat = [];
let bPhrase;
let drums; // part.  attach phrase to part, transport to drive the phrase
let sPat = [1,2,3,4,5,6,7,8]; // step index pattern - 0,1,2...
let sPhrase;
let bpmCTRL;
let beatLength;
let canvas;
let cellWidth;
let matrixX = 550; // default specs for matrix
let matrixY = 100;
let matrixWidth = 300;
let matrixHeight = 60;
let multiplier = 1; // used to determine the inner configuration of the matrix
let numLinesWide = 8;
let masterPatA = [];
let masterPatB = [];

/**
 * OPEN TICKETS
 * - getMatrixDim() should be a one liner
 * - write exportMeasure to handle 16ths and half notes
 * - the base subdivision of masterPatA&B must be 32nd notes
 * - subsequently, the tempo of play must some X multiples of 2 to compensate
 * - alignment wrong on top row on the 7/8-16-32 matrix
 * - record button also to produce square of data - numBeats & subD
 * 
 * 
 * ?? Tap Tempo ??
 */

function setup() {
    const width = 1920;
    const height = 1080;
    createCanvas(width, height);

    background(255,0,0); // paint background

    // Title Text - make async somehow?
    textSize(30);
    stroke('gray');
    fill('white');
    textFont('Righteous');
    text('Multi-meter Sequencer', 200, 30);

    // sound sources
    aa = loadSound('./assets/first_sound.wav', function() {});
    bb = loadSound('./assets/second_sound.wav', function() {});

    // number of beats slider
    numBeatsSld = createSlider(1, 20, 4);
    numBeatsSld.position(100, 150);
    numBeatsSld.style('width', '160px');
    numBeatsSld.input(() => {
        console.log('number of beats changed to ' + numBeatsSld.value());
        beatsVal = numBeatsSld.value();
        fill('red');
        stroke('red');
        rect(numBeatsSld.x, 48, 30, 20);
        updateCellWidth();
        createPatterns();
        drawMatrix();

    });

    // subdivision slider
    // 0-5 base to represent pow(2,n)
    subDivSld = createSlider(0,5,2);
    subDivSld.position(320, 150);
    subDivSld.style('width', '160px');
    subDivSld.input(() => {
        subDVal = pow(2,subDivSld.value());
        fill('red');
        stroke('red');
        rect(subDivSld.x, 48, 30, 20);
        updateCellWidth();
        createPatterns();
        drawMatrix();

    });

    // tempo slider
    tempoSld = createSlider(30,300,120);
    tempoSld.position(100, 250);
    tempoSld.style('width', '160px');
    tempoSld.input(() => {
        fill('red');
        rect(tempoSld.x-8, tempoSld.y-100, 38, 20);
        fill('white');
        textSize(20);
        text(tempoSld.value(), tempoSld.x-8, tempoSld.y-84);
        drums.setBPM(tempoSld.value()/2);
    });

    // start/stop button
    startStopBtn = createButton('Start/Stop');
    startStopBtn.mousePressed(togglePlay);
    startStopBtn.position(320, 210);
    startStopBtn.style('width', '80px');

    // record button
    recordBtn = createButton('Record');
    recordBtn.mousePressed(exportMeasure);
    recordBtn.position(320, 250);

    // reset button
    resetBtn = createButton('Reset');
    resetBtn.mousePressed(resetMatrix);
    resetBtn.position(420, 250);

    // cell width
    cellWidth = matrixWidth/numLinesWide;

    // create main drums part
    drums = new p5.Part();

    // create pattterns for the high and low sounds
    createPatterns();

    // arbitrary
    aPhrase = new p5.Phrase('aa', function(time) {
        aa.play(time);
    }, aPat);
    bPhrase = new p5.Phrase('bb', function(time) {
        bb.play(time);
    }, bPat);
    
    //set tempo
    drums.setBPM(tempoSld.value()/2);

    // add two phrases to drums part
    drums.addPhrase(aPhrase);
    drums.addPhrase(bPhrase);
    drums.addPhrase('seq', sequence, sPat);

    // draw the matrix
    drawMatrix();

    // draw a line to demarcate upper/lower levels
    stroke('gray');
    line(100, 250, 900, 250);

    textSize(20);
    strokeWeight(0);
    text("Number of Beats", numBeatsSld.x+30,65);
    text("Base Subdivision", subDivSld.x+30,65);
    text("Tempo ", tempoSld.x+30,165);
    fill('white');
    stroke('black');
    text(tempoVal*2, tempoSld.x-5,165);

    // lower sequencer section --------------------------------------------------
    // text
    fill('white');
    textSize(30);
    text('Measure Sequencing', 150, 300);    
    
    // buttons
    playBtnB = createButton('Play/Pause');
    playBtnB.position(125+100, 410);

    stopBtnB = createButton('Stop');
    stopBtnB.position(235+100, 410);

    resetBtnB = createButton('Reset');
    resetBtnB.position(305+100, 410);

    tempoSldB = createSlider('Tempo');
    tempoSldB.position(500, 410);
    // tempo label - needs cleanup/mods
    textSize(16);
    stroke(1);
    text('Tempo', 495, 320);
}

function beatsBtn() { // i don't remember why this is here
    console.log('okay ' + this.value());
}

function exportMeasure() {
    console.log('exporting measure');
    const mpLength = masterPatA.length; // master pattern length
    const mpPlusLength = aPat.length+masterPatA.length; // master plus current measure length
    console.log([[...masterPatA], [...masterPatB]]);
    for (let i = mpLength; i < mpPlusLength; i++) {
        if (aPat[i-mpLength] === 1 && bPat[i-mpLength] === 1) {
            masterPatA[i] = 1;
            masterPatB[i] = 1;
        } else if (aPat[i-mpLength] === 1) {
            masterPatA[i] = 1;
            masterPatB[i] = 0;
        } else if (bPat[i-mpLength] === 1) {
            masterPatA[i] = 0;
            masterPatB[i] = 1;
        } else {
            masterPatA[i] = 0;
            masterPatB[i] = 0;
        }
    }
    console.log([[...masterPatA], [...masterPatB]]);
}

function draw() { // this function gets called 60 times a second, arbitrarily
    
    beatsVal = numBeatsSld.value(); // tracks value of numBeats slider
    subDVal = pow(2,subDivSld.value()); // .. of subdivision
    tempoVal = tempoSld.value(); // and tempo

    textSize(18);
    fill('white');
    text(beatsVal, numBeatsSld.x+5,65);
    text(subDVal, subDivSld.x+5,65);

}

function sequence(time, beatIndex) {
    
    // console.log(beatIndex);
    drawMatrix();
    stroke('yellow');
    fill(255,0,0,30);
    rect(matrixX + ((beatIndex-1)*cellWidth), matrixY, cellWidth, matrixHeight);

}

function createPatterns() {

    console.log('create patterns');
    // console.log(subDVal);
    // console.log(beatsVal);

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

        // trim off remaining notes from default 4/4 representation
        while (2*beatsVal < aPat.length) {
            aPat.pop();
            bPat.pop();
        }

    } else { // if less, just eighths

        // console.log('eighths and above');

        if (beatsVal === 3) {
            for (let i = 0; i < beatsVal; i++) {
                if (i === 0) {
                    aPat[i] = 1;
                    bPat[i] = 0;
                } else {
                    aPat[i] = 0;
                    bPat[i] = 1;
                }
            }
        } else if (beatsVal % 3 === 0) {
            // Produces 4/4 >>  1-2-3-4- pattern
            for (let i = 0; i < beatsVal; i++) {
                if (i === 0) {
                    aPat[i] = 1;
                    bPat[i] = 0;
                } else if (i % 3 == 0) {
                    aPat[i] = 0;
                    bPat[i] = 1;
                } else {
                    aPat[i] = 0;
                    bPat[i] = 0;
                }
            }    

        } else {
            // produces 1-3-5-7 in 7/8
            for (let i = 0; i < beatsVal; i++) {
                if (i === 0) {
                    // console.log('1');
                    aPat[i] = 1;
                    bPat[i] = 0;
                } else if (i % 2 == 0) {
                    // console.log('2');
                    aPat[i] = 0;
                    bPat[i] = 1;
                } else {
                    // console.log('3');
                    aPat[i] = 0;
                    bPat[i] = 0;
                }
            }
        }

        // trim off remaining notes from default 4/4 representation
        while (beatsVal < aPat.length) {
            aPat.pop();
            bPat.pop();
        }
    }

    // make sPat - step index
    let tempMult = beatsVal*getMatrixDim();
    // console.log(tempMult + " tempMult with beatsVall" + beatsVal);
    sPat = [];
    for (let i = 0; i < tempMult; i++) {
       
        sPat[i] = i + 1;
        // console.log(sPat[i]);

    }
    // console.log(drums);
    drums.replaceSequence('seq', sPat);
}

function updateCellWidth() {
    // console.log('before values width and lines wide - ' + matrixWidth + " , " + numLinesWide);

    cellWidth = matrixWidth/numLinesWide;
    // console.log(cellWidth);
}

function checkBPM() { // do we need this??
    console.log('checking BPM');

}

function resetMatrix() { // why doesn't this work??
    console.log('resetting matrix');
    console.log('hello');
}

function togglePlay() {
    // console logs settings of last played setting
    // console.log(beatsVal);
    // console.log(subDVal + " subDVal");
    // console.log(tempoVal);
    updateCellWidth();

    // need to know whether to checkPatterns here
    
    // makes sure pattern is updates
    // createPatterns();
    checkBPM();

    // makes sure sounds are loaded before trying to play drums    
    if (aa.isLoaded() && bb.isLoaded()) {
        if (!drums.isPlaying) {
            console.log('starting loop');
            console.log(aPat);
            drums.metro.metroTicks = 0; // reset loop to start 
            drums.loop();
        } else {
            drums.stop(); // works like a pause button
        }
    } else { // if sounds haven't loaded yet
        console.log('hold on a sec');
    }
}

// when the user alters aPat or bPat, update phrase(?!)
function updatePatterns() {

    drums.replaceSequence('aa', aPat);
    drums.replaceSequence('bb', bPat);

    console.log('sequences replaced');

}

function drawMatrix() {
    // createPatterns(); // turning this off helps matrix interactivity
    multiplier = getMatrixDim();
    numLinesWide = beatsVal * multiplier;
    // console.log('drawing matrix now');
    // console.log(subDVal + ' subDVal')
    // console.log('multiplier ' + multiplier);
    // console.log('numLinesWide ' + numLinesWide);
    // background(80);
    fill(80);
    stroke('white');
    rect(550, 100, 300, 60);

    stroke('gray');
    strokeWeight(2);
    fill('white');
    for (let i = 0; i <= numLinesWide; i++) {
        // console.log('first loop, count ' + i);
        line(i * matrixWidth / numLinesWide + matrixX, matrixY, i * matrixWidth / numLinesWide + matrixX, matrixY + matrixHeight);
    }
    for (let i = 0; i < 3; i++) {
        line(matrixX, (i * matrixHeight / 2) + matrixY, matrixWidth + matrixX, (i * matrixHeight / 2) + matrixY);
    }
    // console.log(numLinesWide);
    for (let i = 0; i < numLinesWide; i++) {
        if (aPat[i] === 1) { // may have to fix this later.... maybe not
            ellipse((i * matrixWidth / (numLinesWide) + 0.25 * matrixWidth / beatsVal) + matrixX, matrixY + (matrixHeight/4), 15);
        }
        if (bPat[i] === 1) {
            ellipse((i * matrixWidth / numLinesWide) + matrixX + ( 0.5 * matrixWidth / numLinesWide), matrixY + (matrixHeight/4) * 3, 15);
        }
    }
}

function getMatrixDim() { // one liner?
    if (subDVal <= 4) {
        return 2;
    } else {
        return 1;
    }
}

function mousePressed(event) {
    // console.log(aPat);
    // console.log(bPat);

    // console.log(event.srcElement.innerHTML);

    // mouse press event for matrix reset - can I put this in a function? why doesn't it work?
    if (event.srcElement.innerHTML === 'Reset') {
       createPatterns();
       drawMatrix();
    }

    let colClicked = Math.floor((event.offsetX - matrixX) / (matrixWidth/numLinesWide));
    let rowClicked = Math.floor((event.offsetY - matrixY) / (matrixHeight/2));

    // console.log(colClicked);
    // console.log(rowClicked);
    if ((rowClicked >= 0 && rowClicked < 2) && (colClicked >= 0 && colClicked < numLinesWide)) {
        console.log('matrix clicked');
    }

    // change the values of aPat and bPat based on clicks
    if (rowClicked === 0) {
        console.log('first row');
        aPat[colClicked] = aPat[colClicked] === 0 ? 1 : 0;
        console.log(aPat);
        
        // update phrase
        updatePatterns();
        drawMatrix();
    } else if (rowClicked === 1) {
        console.log('second row');
        bPat[colClicked] = bPat[colClicked] === 0 ? 1 : 0;
        console.log(bPat);
        // update phrase
        updatePatterns();
        drawMatrix();
    } else {
        console.log('click off of matrix');
    }

}


