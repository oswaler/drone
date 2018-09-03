'use strict';

var Alexa = require('alexa-sdk');

Alexa.APP_ID = 'amzn1.ask.skill.092aa3ec-992f-446a-8c5f-9996a5075459';

//Base url to build URLs from
const BASE_URL = 'https://ericoswald.com';

var streamInfo = {
  title: 'Audio Stream Starter',
  subtitle: 'A starter template for an Alexa audio streaming skill.',
  cardContent: "Get more details at: https://skilltemplates.com",
  url: 'https://streaming.radionomy.com/RadioXUS?lang=en-US&appName=iTunes.m3u',
  image: {
    largeImageUrl: 'https://s3.amazonaws.com/cdn.dabblelab.com/img/alexa-card-lg.png',
    smallImageUrl: 'https://s3.amazonaws.com/cdn.dabblelab.com/img/alexa-card-sm.png'
  }
};

 //Patterns to construct sound file URL
 //Use enharmonics to reduce number of files needed
const pitchEndUrl = {
  C: {
      doubleflat: '/Bflat.mp3',
      flat: '/B.mp3',
      natural: '/C.mp3',
      sharp: '/Csharp.mp3',
      doublesharp: '/D.mp3'
  },
    
  D: {
      doubleflat: '/C.mp3',
      flat: '/Csharp.mp3',
      natural: '/D.mp3',
      sharp: '/Eflat.mp3',
      doublesharp: '/E.mp3'
  },
  E: {
      doubleflat: '/D.mp3',
      flat: '/Eflat.mp3',
      natural: '/E.mp3',
      sharp: '/F.mp3',
      doublesharp: '/Fsharp.mp3'
  },
  F: {
      doubleflat: '/Eflat.mp3',
      flat: '/E.mp3',
      natural: '/F.mp3',
      sharp: '/Fsharp.mp3',
      doublesharp: '/G.mp3'
  },
  G: {
      doubleflat: '/F.mp3',
      flat: '/Fsharp.mp3',
      natural: '/G.mp3',
      sharp: '/Aflat.mp3',
      doublesharp: '/A.mp3'
  },
  A: {
      doubleflat: '/G.mp3',
      flat: '/Aflat.mp3',
      natural: '/A.mp3',
      sharp: '/Bflat.mp3',
      doublesharp: '/B.mp3'
  },
  B: {
      doubleflat: '/A.mp3',
      flat: '/Bflat.mp3',
      natural: '/B.mp3',
      sharp: '/C.mp3',
      doublesharp: '/Csharp.mp3'
  }
};

//Used for translating accidental text to appropriate character
const accidentalToChar = {
  doubleflat: '♭♭',
  flat: '♭',
  natural: '', //'♮'
  sharp: '♯',
  doublesharp: 'x'
};

exports.handler = (event, context, callback) => {
  var alexa = Alexa.handler(event, context, callback);

  alexa.registerHandlers(
    handlers,
    audioEventHandlers
  );

  alexa.execute();
};

var handlers = {
  'LaunchRequest': function() {
   const startSpeech = "Welcome to Music Drone. What note would you like? \
   You can say things like G natural, or F sharp.";
   
   const startReprompt = "What note would you like?";
   this.emit(':ask', startSpeech, startReprompt);
    
    //this.emit(':responseReady');
    //this.emit('PlayStream');
  },
  'GetPitchIntent': function() {

       //might need to change pitch filter to allow any letter
       //so wrong values can be handled gracefully
       //probably need to add all letters to intent too.
    const pitchValue = this.event.request.intent.slots.pitch.value;
    const pitch = (pitchValue || '').trim().toUpperCase().replace(/[^A-Z]/g, '').charAt(0);
    const firstModValue = this.event.request.intent.slots.FirstModifier.value;
    const firstMod = (firstModValue || '').trim().toLowerCase();
    const secondModValue = this.event.request.intent.slots.SecondModifier.value;
    const secondMod = (secondModValue || '').trim().toLowerCase();
    
    // if there's a second modifier, the second modifier is the accidental.
    // otherwise, it's the first modifier.
    let accidental = secondMod ?  secondMod : firstMod;
    if (!accidental) {
            accidental = 'natural';
    }
    
    // if there's a second modifier, the first modifier is the multiplier.
    // otherwise, the multiplier doesn't exist
    let multiplier = secondMod ? firstMod : '';
    
 // this translates things like "shark" to "sharp"
        // or "flight" to "flat"
        if (/^sh/i.test(accidental)) {
          accidental = 'sharp';
      } else if (/^f/i.test(accidental)) {
          accidental = 'flat';
      } else if (/^n/i.test(accidental)) {
          accidental = 'natural';
      }
      
      // this translates "double" soundalikes
      if (/^d/i.test(multiplier)) {
          multiplier = 'double';
      }

    
    //Check for any invalid input and ask for note again, otherwise construct and send output.
    const noteRequested = 'You requested ' + pitch + ' ' + multiplier + ' ' + accidental; 
    
    //Validate pitch given was A-G
    const validPitch = ["A", "B", "C", "D", "E", "F", "G"];
    
    if (validPitch.indexOf(pitch) === -1) {
    
    var badPitch = noteRequested + '. The note must be AY, B, C, D, E, F, or G. \
    . You can also say something like Ay flat or C double sharp. What note would you like?';
  
    this.emit(':ask', badPitch, badPitch);
    }
    
    // validate that the user gave a valid accidental
    else if (['flat', 'natural', 'sharp'].indexOf(accidental) === -1) {
      
      var badAccidental = noteRequested + '. The accidental must be flat, \
      sharp or natural. What note would you like?.';
      
      this.emit(':ask', badAccidental, badAccidental);
    }
    
    // validate that the user gave a valid multiplier
    else if (multiplier !== '' && multiplier !== 'double') {
      
      var badMultiplierText = noteRequested + '. If you use three words to describe your note, \
      the second word must be double. So you can say something like C double \
      flat, or F double sharp. What note would you like?';

      this.emit(':ask', badMultiplierText,badMultiplierText);
    }

     // validate that the user didn't say "double natural"
    else if (multiplier === 'double' && accidental === 'natural') {
     
      var badCombinationText = noteRequested + '. There is no such thing \
      as a note that is double natural. ' + 'What note would you like?';
      
      this.emit(':ask', badCombinationText, badCombinationText);
    }

    //If all checks are passed then play the note
    else {

        //Construct spoken output
        const speechOutput = 
        // message 
          pitch 
          + (multiplier ? ' ' + multiplier : '')
          + (accidental === 'natural' ? '' : ' ' + accidental);

        //Construct sound file URL
        const fileURL = BASE_URL + pitchEndUrl[pitch][multiplier + accidental];

        //Construct printed output
        const pitchChar = pitch + accidentalToChar[multiplier + accidental];
        const txtOutput = pitchChar + ' ' + fileURL;
          
        //Output to card and voice
        this.response.cardRenderer('OK', txtOutput);
        this.response.speak(speechOutput);
        this.emit(':responseReady');
    }
  },

  'noteIntent': function() {
    //this.emit('PlayStream');
   
    //Create objects to hold possible interpretations of each note

  var arrC = ['c.', 'C', 'c', 'C natural', 'attrill', 'trill', 'See natural', 'seat', 'seat natural'];
  var arrD = ['d.', 'd', 'D', 'die', 'dye', 'TV', 'TV natural', 'Dean Hatcher', 'teenager','diner','diner natural','the natural',
                'at the natural','D natural','t natural',
                't. natural','denaturalize', 'denatural', 't.','T', 'd flat', 'die flat'];
  
  // Get note read from user 
  let slotValue = this.event.request.intent.slots.note.value; 
  var txtResult;
   
  //Find out what note was chosen and assign proper statement
  if (arrC.indexOf(slotValue) != -1){
    txtResult = "It was the C natural.";
  }
  else if(arrD.indexOf(slotValue) != -1){
    txtResult = "It was the D.";
  }
   else {
     txtResult= "I didn't get it.";
   }
  
   let outSpeech = txtResult + " Original was " + slotValue;
  
   // play result back
   this.response.cardRenderer(slotValue, txtResult);
  this.response.speak(outSpeech);
  this.emit(':responseReady');
  },

  'PlayStream': function() {
    
    
    this.response.speak('Enjoy.').audioPlayerPlay('REPLACE_ALL', streamInfo.url, streamInfo.url, null, 0);
    this.emit(':responseReady');
  },
  'AMAZON.HelpIntent': function() {
   // On help request explain what user can do and wait for a response.
   
   const helpSpeech = "I will play a sustained tone for you on the viola. \
   You can ask for any scale tone. You can ask for tones by saying things \
   like G natural, F sharp, B flat, or C double sharp. \
   You can also ask for an AY Four Forty. If your device has a screen I \
   will show you the note I\'m playing. When you are finished you can say Stop. \
   What note would you like?";
   
   const helpReprompt = "What note would you like?";
   this.emit(':ask', helpSpeech, helpReprompt);
    
    //this.emit(':responseReady');
  },
  'SessionEndedRequest': function() {
    // no session ended logic needed
  },
  'ExceptionEncountered': function() {
    console.log("\n---------- ERROR ----------");
    console.log("\n" + JSON.stringify(this.event.request, null, 2));
    this.callback(null, null)
  },
  'Unhandled': function() {
    this.response.speak('Sorry. Something went wrong.');
    this.emit(':responseReady');
  },
  'AMAZON.NextIntent': function() {
    this.response.speak('This skill does not support skipping.');
    this.emit(':responseReady');
  },
  'AMAZON.PreviousIntent': function() {
    this.response.speak('This skill does not support skipping.');
    this.emit(':responseReady');
  },
  'AMAZON.PauseIntent': function() {
    this.emit('AMAZON.StopIntent');
  },
  'AMAZON.CancelIntent': function() {
    this.emit('AMAZON.StopIntent');
  },
  'AMAZON.StopIntent': function() {
    this.response.speak('Ok').audioPlayerStop();
    this.emit(':responseReady');
  },
  'AMAZON.ResumeIntent': function() {
    this.emit('PlayStream');
  },
  'AMAZON.LoopOnIntent': function() {
    this.emit('AMAZON.StartOverIntent');
  },
  'AMAZON.LoopOffIntent': function() {
    this.emit('AMAZON.StartOverIntent');
  },
  'AMAZON.ShuffleOnIntent': function() {
    this.emit('AMAZON.StartOverIntent');
  },
  'AMAZON.ShuffleOffIntent': function() {
    this.emit('AMAZON.StartOverIntent');
  },
  'AMAZON.StartOverIntent': function() {
    this.response.speak('Sorry. I can\'t do that yet.');
    this.emit(':responseReady');
  },
  'PlayCommandIssued': function() {

    if (this.event.request.type === 'IntentRequest' || this.event.request.type === 'LaunchRequest') {
      var cardTitle = streamInfo.subtitle;
      var cardContent = streamInfo.cardContent;
      var cardImage = streamInfo.image;
      this.response.cardRenderer(cardTitle, cardContent, cardImage);
    }

    this.response.speak('Enjoy.').audioPlayerPlay('REPLACE_ALL', streamInfo.url, streamInfo.url, null, 0);
    this.emit(':responseReady');
  },
  'PauseCommandIssued': function() {
    this.emit('AMAZON.StopIntent');
  }
}

var audioEventHandlers = {
  'PlaybackStarted': function() {
    this.emit(':responseReady');
  },
  'PlaybackFinished': function() {
    this.emit(':responseReady');
  },
  'PlaybackStopped': function() {
    this.emit(':responseReady');
  },
  'PlaybackNearlyFinished': function() {
    this.response.audioPlayerPlay('REPLACE_ALL', streamInfo.url, streamInfo.url, null, 0);
    this.emit(':responseReady');
  },
  'PlaybackFailed': function() {
    this.response.audioPlayerClearQueue('CLEAR_ENQUEUED');
    this.emit(':responseReady');
  }
}
