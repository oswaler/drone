'use strict';

var Alexa = require('alexa-sdk');

const makeImage = Alexa.utils.ImageUtils.makeImage; //Utility used in rendering the templates
Alexa.APP_ID = 'amzn1.ask.skill.092aa3ec-992f-446a-8c5f-9996a5075459';

//used to tell makeTemplate() whether to show 'play' or 'stop' graphics
var playStatus = '';

//Base urls used to build URLs
const SOUNDCLOUD_BASE_URL = 'https://feeds.soundcloud.com/stream/';
const S3_BASE_URL = 'https://s3.amazonaws.com/ericcricketsnvirginia/drone/';


//Commonly used message text
const startSpeech = "Welcome to Pitch Drone. What note would you like? \
   You can say things like C, G sharp, or B double flat. You can also say AY 4 40.";
   
const startReprompt = "What note would you like?";

// ****** Very important object
//This object holds all info important to the note requested and its output
var objNotePackage = {
    
    cardPlayImage: { //Holds the 2 images required by ALexa SDK to render card output when audio plays
      largeImageUrl: '', //1024x800 image. According to SDK docs it must be named exactly like this
      smallImageUrl: '', //740x480 image. According to SDK docs it must be named exactly like this
    },
    templatePlayImage: '', //1200x800 image used in template displayed on play
    
    cardSignOffImage: { //Holds the 2 images required by ALexa SDK to render card output when audio stops
      largeImageUrl: 'https://s3.amazonaws.com/ericcricketsnvirginia/drone/signoff1024x600.png', //1024x800 image. According to SDK docs it must be named exactly like this
      smallImageUrl: 'https://s3.amazonaws.com/ericcricketsnvirginia/drone/signoff720x480.png', //740x480 image. According to SDK docs it must be named exactly like this
    },
    templateSignOffImage: 'https://s3.amazonaws.com/ericcricketsnvirginia/drone/signoff1200x800.png', //1200x800 image used in template displayed on play stop
    
    audioUrl: '', //sound file to play
    pitch: '', //The pitch requested by the user read from pitch slot of GetPitchIntent
    accidental: '', //The accidental (flat, sharp, etc) requested by the user read from pitch slot of GetPitchIntent
    multiplier: '', //The multiplier (double) requested by the user read from pitch slot of GetPitchIntent
    pitchChar: '' // Holds the constructed screen-friendly version of the note the user requested.
  };

var streamInfo = {
  title: 'Audio Stream Starter',
  subtitle: 'A starter template for an Alexa audio streaming skill.',
  cardContent: "Get more details at: https://skilltemplates.com",
  url: 'https://streaming.radionomy.com/RadioXUS?lang=en-US&appName=iTunes.m3u',
  image: {
    largeImageUrl: 'https://s3.amazonaws.com/ericcricketsnvirginia/drone/signoff1024x600.png',
    smallImageUrl: 'https://s3.amazonaws.com/ericcricketsnvirginia/drone/signoff720x480.png',
  }
};


 //Patterns to construct sound file URL
 //Use enharmonics to reduce number of files needed
 
 //Contains URLs for sound files stored on SoundCloud
 const pitchSoundcloudEndUrl = {
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
      flat: '',//'496686249-user-973941472-bflat.mp3',
      natural: '496686048-user-973941472-b-1.mp3',
      sharp: '/C.mp3',
      doublesharp: '/Csharp.mp3'
  }
};

//Contains sound file URLs for files stored on Amazon S3
 const pitchS3EndUrl = {
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
      natural: '496165830-user-973941472-b-loop-mixdown.mp3',
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
   
   this.emit(':ask', startSpeech, startReprompt);
    
    //this.emit(':responseReady');
    //this.emit('PlayStream');
  },
  'GetPitchIntent': function() {

    //Get pitch, multiplier and accidental and translate them to a standard format.
    // pitch is var rather than const because some cleanup code later translates
    // common Alexa misunderstandings in pitch letters
    const pitchValue = this.event.request.intent.slots.pitch.value;
    objNotePackage.pitch = (pitchValue || '').trim().toUpperCase().replace(/[^A-Z]/g, '').charAt(0);
    const firstModValue = this.event.request.intent.slots.FirstModifier.value;
    const firstMod = (firstModValue || '').trim().toLowerCase();
    const secondModValue = this.event.request.intent.slots.SecondModifier.value;
    const secondMod = (secondModValue || '').trim().toLowerCase();
    
    // if there's a second modifier, the second modifier is the accidental.
    // otherwise, it's the first modifier.
    objNotePackage.accidental = secondMod ?  secondMod : firstMod;
    if (!objNotePackage.accidental) {
      objNotePackage.accidental = 'natural';
    }
    
    // if there's a second modifier, the first modifier is the multiplier.
    // otherwise, the multiplier doesn't exist
    objNotePackage.multiplier = secondMod ? firstMod : '';
    
 // this translates things like "shark" to "sharp"
 // or "flight" to "flat"
        if (/^sh/i.test(objNotePackage.accidental)) {
          objNotePackage.accidental = 'sharp';
      } else if (/^f/i.test(objNotePackage.accidental)) {
        objNotePackage.accidental = 'flat';
      } else if (/^n/i.test(objNotePackage.accidental)) {
        objNotePackage.accidental = 'natural';
      }
      
      // this translates "double" soundalikes
      if (/^d/i.test(objNotePackage.multiplier)) {
        objNotePackage.multiplier = 'double';
      }

      //This translates common pitch soundalikes
      if (objNotePackage.pitch == 'S') {
        objNotePackage.pitch = 'C';
      }
      if (objNotePackage.pitch == 'T') {
        objNotePackage.pitch = 'D';
      }

    //Check for any invalid input and ask for note again, otherwise construct and send output.
    const noteRequested = 'You requested ' + objNotePackage.pitch + ' ' + objNotePackage.multiplier + ' ' + objNotePackage.accidental; 
    
    //Validate pitch given was A-G
    const validPitch = ["A", "B", "C", "D", "E", "F", "G"];
    if (validPitch.indexOf(objNotePackage.pitch) === -1) {
    
    var badPitch = noteRequested + '. The note must be AY, B, C, D, E, F, or G. \
    . You can also say something like Ay flat or C double sharp. What note would you like?';
  
    this.emit(':ask', badPitch, badPitch);
    }
    
    // validate that the user gave a valid accidental
    else if (['flat', 'natural', 'sharp', '4', '40'].indexOf(objNotePackage.accidental) === -1) {
      
      var badAccidental = noteRequested + '. The accidental must be flat, \
      sharp or natural. What note would you like?.';
      
      this.emit(':ask', badAccidental, badAccidental);
    }
    
    // validate that the user gave a valid multiplier
   
    else if (objNotePackage.multiplier !== '' && ['double', '4'].indexOf(objNotePackage.multiplier) === -1) {
      var badMultiplierText = noteRequested + '. If you use three words to describe your note, \
      the second word must be double, or you may specifically ask for an Ay 4 40. \
      So you can say something like C double \
      flat, or F double sharp, or Ay 4 40. What note would you like?';
      const outTest =  objNotePackage.pitch + ' ' + objNotePackage.multiplier + ' ' + objNotePackage.accidental;
      this.emit(':ask', badMultiplierText,badMultiplierText);
    }

     // validate that the user didn't say "double natural"
     else if (objNotePackage.multiplier === 'double' && objNotePackage.accidental === 'natural') {
     
      var badCombinationText = noteRequested + '. Notes cannot be \
       double natural. ' + 'What note would you like?';
      
      this.emit(':ask', badCombinationText, badCombinationText);
     }

    //If all checks are passed then play the note and output to card/template
    else {

        //Construct spoken output. If pitch is A have Alexa pronounce it as AY
        var pitchSpeech
        if (objNotePackage.pitch == 'A'){
          pitchSpeech = 'AY';
        }
        else {
          pitchSpeech = objNotePackage.pitch;
        }
        const speechOutput = 
          pitchSpeech 
          + (objNotePackage.multiplier ? ' ' + objNotePackage.multiplier : '')
          + (objNotePackage.accidental === 'natural' ? '' : ' ' + objNotePackage.accidental);
        
          
        //Construct sound file URL - Check for special case of A440
        if (['4', '40'].indexOf(objNotePackage.accidental) === -1){

          objNotePackage.audioUrl = SOUNDCLOUD_BASE_URL + pitchSoundcloudEndUrl[objNotePackage.pitch][objNotePackage.multiplier + objNotePackage.accidental];
        }
        else {
          objNotePackage.audioUrl = SOUNDCLOUD_BASE_URL + '/A440.mp3';
        }
         
       //Output to available screen
        makeTemplate.call(this, 'play');
       
        this.response.speak(speechOutput).audioPlayerPlay('REPLACE_ALL', objNotePackage.audioUrl, 1, null, 0);
        console.log();
        this.emit(':responseReady');
    }
  },

 
  'PlayStream': function() {
    
    //if (!objNotePackage.audioUrl) {
      const againText = 'Sorry, I didn\'t understand your request. ' + startSpeech;  
      this.emit(':ask', againText, startReprompt);
    //}
    /*
    else {
      this.response.cardRenderer('OK', objNotePackage.audioUrl);
      this.response.speak('URL is:' + objNotePackage.audioUrl);
      //objNotePackage.audioUrl = 'https://streaming.radionomy.com/RadioXUS?lang=en-US&appName=iTunes.m3u';
      //this.response.speak('Here').audioPlayerPlay('REPLACE_ALL', objNotePackage.audioUrl, objNotePackage.audioUrl, null, 0);
      this.emit(':responseReady');
    }*/
  },
  'AMAZON.HelpIntent': function() {
   // On help request explain what user can do and wait for a response.
   
   const helpSpeech = "I will play a sustained tone for you on the viola. \
   You can ask for any scale tone. You can ask for tones by saying things \
   like D, G natural, F sharp, B flat, or C double sharp. \
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
    
    //output to available screen
    makeTemplate.call(this, 'stop');
 
    this.response.speak('Ok. I sent a practice tip to your Alexa app.').audioPlayerStop();
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
    this.response.speak('Sorry. I can\'t do that.');
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
    console.log()
    this.response.audioPlayerPlay('REPLACE_ALL', objNotePackage.audioUrl, objNotePackage.audioUrl, null, 0);
    this.emit(':responseReady');
  },
  'PlaybackFailed': function() {
    this.response.audioPlayerClearQueue('CLEAR_ENQUEUED');
    this.emit(':responseReady');
  }
}
function supportsDisplay() {
  var hasDisplay =
  this.event.context &&
  this.event.context.System &&
  this.event.context.System.device &&
  this.event.context.System.device.supportedInterfaces &&
  this.event.context.System.device.supportedInterfaces.Display

  return hasDisplay;
}



//This function handles the visual output. It checks whether the user device has a screen
//and renders a template if it does. If not it outputs to a card in the Alexa app.
//Parameters:  playStatus should be either 'play' or 'stop'
//             pitchCharacter should be the the pitchChar variable from the handler. It is 
//             the screen-friendly version of the note requested.
//Be sure to include keyword this as the first parameter to bind the scope.
//example of use: makeTemplate.call(this, 'play', pitchChar);
function makeTemplate(playStatus){
  
  if (playStatus == 'play'){
    //Construct image file URLs - Check for special case of A440
    //This is redundant and inefficient, since I'm constructing the URLs, putting them in
    //the objNotePackage object, then immediately reading them into another variable.
    //With this template function I can remove these properties from objNotePackage
    //but I like having them in one centralized place
    if (['4', '40'].indexOf(objNotePackage.accidental) === -1){
          
      objNotePackage.templatePlayImage = S3_BASE_URL + objNotePackage.pitch + objNotePackage.multiplier + (objNotePackage.accidental === 'natural' ? '' : objNotePackage.accidental) + '1200x800.png';
      objNotePackage.cardPlayImage.largeImageUrl = S3_BASE_URL + objNotePackage.pitch + objNotePackage.multiplier + (objNotePackage.accidental === 'natural' ? '' : objNotePackage.accidental) + '1024x800.png';
      objNotePackage.cardPlayImage.smallImageUrl = S3_BASE_URL + objNotePackage.pitch + objNotePackage.multiplier + (objNotePackage.accidental === 'natural' ? '' : objNotePackage.accidental) + '720x480.png';
      
      //Construct screen-friendly version of note requested 
      objNotePackage.pitchChar = objNotePackage.pitch + accidentalToChar[objNotePackage.multiplier + objNotePackage.accidental];
    }
    else {
      objNotePackage.templatePlayImage = S3_BASE_URL + 'A4401200x800.png';
      objNotePackage.cardPlayImage.largeImageUrl = S3_BASE_URL + 'A4401024x800.png';
      objNotePackage.cardPlayImage.smallImageUrl = S3_BASE_URL + 'A440720x480.png';
       
      //Construct screen-friendly version of note requested 
      objNotePackage.pitchChar = 'A440';
    }

    var tempTitle = 'Play Well! ';
    var tempShowImage = objNotePackage.templatePlayImage;
    var cardShowImage = objNotePackage.cardPlayImage;
    var cardShowTitle = 'Now Playing: ' + objNotePackage.pitchChar;
    var cardShowContent = getPracticeTip();
  }
  else {
    var tempTitle = 'Hope You Had a Good Practice!';
    var tempShowImage = objNotePackage.templateSignOffImage;
    var cardShowImage = objNotePackage.cardSignOffImage;
    var cardShowTitle = 'Hope You Had a Good Practice!';
    var cardShowContent = 'Thank you for using Pitch Drone! \
    Your reviews help guide us in developing better tools. Please don\'t hesitate to \
  contact us at gentleechodesigns@gmail.com';
  }

  if (supportsDisplay.call(this))
  {
    
       const bodyTemplate7 = new Alexa.templateBuilders.BodyTemplate7Builder();
                    var template = bodyTemplate7.setTitle(tempTitle)
                                        .setImage(makeImage(tempShowImage))
                                        .build();
                                        
                    this.response.renderTemplate(template)
                                        .shouldEndSession(null);
       this.response.cardRenderer(cardShowTitle, cardShowContent, cardShowImage);
  }
  else {
    this.response.cardRenderer(cardShowTitle, cardShowContent, cardShowImage);
  }
return;
}

//This function chooses a practice tip at random and returns the tip as a string.
function getPracticeTip(){


   const practiceTip = [
  'With focus and consistency you\'ll always see great improvement.',
  'Keep a daily practice log. That way you\'ll always know what you\'ve worked on and where you are with it.',
  'Never start a practice by wondering what you should work on today. Use your practice log to determine what you did last time and where you need to begin.',
  'To get better you need effortful, consistent practice. If you work hard but only practice once in a while, you will not progress. If you practice every day but don\'t push yourself, you won\'t progress.', 
  'Use timers when you practice. For instance, when you practice a scale, set a timer for 10 minutes. When the timer ends then stop. This forces you to focus on one aspect of what you are doing. Open ended practice often leads to lack of focus and results in a lot of time spent with no specific result.',
  'Break up your repertoire practice into timed parts. For instance, if you are working on 3 pieces, spend 10 minutes on each for a total of 30 minutes. Take a break and do the same thing again. Take a break and do it again. You still get an hour and a half of practice but there is a big mental benefit to working on them in interleaved chunks.',
  'Never do exactly the same practice two days in a row. Use your practice log to record each thing you practiced along with tempo and notes on intonation, tone, etc. In every practice refer to your practice log and make sure you strive to get some aspect of each thing you practice a little better than last time.'
];

var practiceTipIndex = Math.floor(Math.random() * practiceTip.length);
var randomTip = practiceTip[practiceTipIndex];

return randomTip;
}