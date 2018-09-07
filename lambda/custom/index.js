'use strict';

var Alexa = require('alexa-sdk');

Alexa.APP_ID = 'amzn1.ask.skill.092aa3ec-992f-446a-8c5f-9996a5075459';

//Base url to build URLs from
const SOUNDCLOUD_BASE_URL = 'https://feeds.soundcloud.com/stream/';
const S3_BASE_URL = 'https://s3.amazonaws.com/ericcricketsnvirginia/drone/';
var audioURL = ''; //sound file
var imgURL = ''; //image file

//Commonly used message text
const startSpeech = "Welcome to Music Drone. What note would you like? \
   You can say things like C, G natural, or F sharp. You can also say AY 4 40.";
   
const startReprompt = "What note would you like?";

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
      flat: '496686249-user-973941472-bflat.mp3',
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

//Patterns to construct image file URL
const imgEndUrl = {
  C: {
      doubleflat: {
        largeImageURL: S3_BASE_URL + 'Cdflat1024x600.png',
        smallImageURL: S3_BASE_URL + 'Cdflat720x480.png',
        xlargeImageUrl: S3_BASE_URL + 'Cdflat1200x800.png'
    },
      flat: {
        largeImageURL: S3_BASE_URL + 'Cflat1024x600.png',
        smallImageURL: S3_BASE_URL + 'Cflat720x480.png',
        xlargeImageUrl: S3_BASE_URL + 'Cflat1200x800.png'
    },
      natural: {
        largeImageURL: S3_BASE_URL + 'C1024x600.png',
        smallImageURL: S3_BASE_URL + 'C720x480.png',
        xlargeImageUrl: S3_BASE_URL + 'C1200x800.png'
    },
      sharp: {
        largeImageURL: S3_BASE_URL + 'Csharp1024x600.png',
        smallImageURL: S3_BASE_URL + 'Csharp720x480.png',
        xlargeImageUrl: S3_BASE_URL + 'Csharp1200x800.png'
    },
      doublesharp: {
        largeImageURL: S3_BASE_URL + 'Cdsharp1024x600.png',
        smallImageURL: S3_BASE_URL + 'Cdsharp720x480.png',
        xlargeImageUrl: S3_BASE_URL + 'Cdsharp1200x800.png'
    },
  }, 
  D: {
    doubleflat: {
      largeImageURL: S3_BASE_URL + 'Ddflat1024x600.png',
      smallImageURL: S3_BASE_URL + 'Ddflat720x480.png',
      xlargeImageUrl: S3_BASE_URL + 'Ddflat1200x800.png'
  },
    flat: {
      largeImageURL: S3_BASE_URL + 'Dflat1024x600.png',
      smallImageURL: S3_BASE_URL + 'Dflat720x480.png',
      xlargeImageUrl: S3_BASE_URL + 'Dflat1200x800.png'
  },
    natural: {
      largeImageURL: S3_BASE_URL + 'D1024x600.png',
      smallImageURL: S3_BASE_URL + 'D720x480.png',
      xlargeImageUrl: S3_BASE_URL + 'D1200x800.png'
  },
    sharp: {
      largeImageURL: S3_BASE_URL + 'Dsharp1024x600.png',
      smallImageURL: S3_BASE_URL + 'Dsharp720x480.png',
      xlargeImageUrl: S3_BASE_URL + 'Dsharp1200x800.png'
  },
    doublesharp: {
      largeImageURL: S3_BASE_URL + 'Ddsharp1024x600.png',
      smallImageURL: S3_BASE_URL + 'Ddsharp720x480.png',
      xlargeImageUrl: S3_BASE_URL + 'Ddsharp1200x800.png'
  },
},
  E: {
    doubleflat: {
      largeImageURL: S3_BASE_URL + 'Edflat1024x600.png',
      smallImageURL: S3_BASE_URL + 'Edflat720x480.png',
      xlargeImageUrl: S3_BASE_URL + 'Edflat1200x800.png'
  },
    flat: {
      largeImageURL: S3_BASE_URL + 'Eflat1024x600.png',
      smallImageURL: S3_BASE_URL + 'Eflat720x480.png',
      xlargeImageUrl: S3_BASE_URL + 'Eflat1200x800.png'
  },
    natural: {
      largeImageURL: S3_BASE_URL + 'E1024x600.png',
      smallImageURL: S3_BASE_URL + 'E720x480.png',
      xlargeImageUrl: S3_BASE_URL + 'E1200x800.png'
  },
    sharp: {
      largeImageURL: S3_BASE_URL + 'Esharp1024x600.png',
      smallImageURL: S3_BASE_URL + 'Esharp720x480.png',
      xlargeImageUrl: S3_BASE_URL + 'Esharp1200x800.png'
  },
    doublesharp: {
      largeImageURL: S3_BASE_URL + 'Edsharp1024x600.png',
      smallImageURL: S3_BASE_URL + 'Edsharp720x480.png',
      xlargeImageUrl: S3_BASE_URL + 'Edsharp1200x800.png'
  },
},
  F: {
    doubleflat: {
      largeImageURL: S3_BASE_URL + 'Fdflat1024x600.png',
      smallImageURL: S3_BASE_URL + 'Fdflat720x480.png',
      xlargeImageUrl: S3_BASE_URL + 'Fdflat1200x800.png'
  },
    flat: {
      largeImageURL: S3_BASE_URL + 'Fflat1024x600.png',
      smallImageURL: S3_BASE_URL + 'Fflat720x480.png',
      xlargeImageUrl: S3_BASE_URL + 'Fflat1200x800.png'
  },
    natural: {
      largeImageURL: S3_BASE_URL + 'F1024x600.png',
      smallImageURL: S3_BASE_URL + 'F720x480.png',
      xlargeImageUrl: S3_BASE_URL + 'F1200x800.png'
  },
    sharp: {
      largeImageURL: S3_BASE_URL + 'Fsharp1024x600.png',
      smallImageURL: S3_BASE_URL + 'Fsharp720x480.png',
      xlargeImageUrl: S3_BASE_URL + 'Fsharp1200x800.png'
  },
    doublesharp: {
      largeImageURL: S3_BASE_URL + 'Fdsharp1024x600.png',
      smallImageURL: S3_BASE_URL + 'Fdsharp720x480.png',
      xlargeImageUrl: S3_BASE_URL + 'Fdsharp1200x800.png'
  },
},
  G: {
    doubleflat: {
      largeImageURL: S3_BASE_URL + 'Gdflat1024x600.png',
      smallImageURL: S3_BASE_URL + 'Gdflat720x480.png',
      xlargeImageUrl: S3_BASE_URL + 'Gdflat1200x800.png'
  },
    flat: {
      largeImageURL: S3_BASE_URL + 'Gflat1024x600.png',
      smallImageURL: S3_BASE_URL + 'Gflat720x480.png',
      xlargeImageUrl: S3_BASE_URL + 'Gflat1200x800.png'
  },
    natural: {
      largeImageURL: S3_BASE_URL + 'G1024x600.png',
      smallImageURL: S3_BASE_URL + 'G720x480.png',
      xlargeImageUrl: S3_BASE_URL + 'G1200x800.png'
  },
    sharp: {
      largeImageURL: S3_BASE_URL + 'Gsharp1024x600.png',
      smallImageURL: S3_BASE_URL + 'Gsharp720x480.png',
      xlargeImageUrl: S3_BASE_URL + 'Gsharp1200x800.png'

  },
    doublesharp: {
      largeImageURL: S3_BASE_URL + 'Gdsharp1024x600.png',
      smallImageURL: S3_BASE_URL + 'Gdsharp720x480.png',
      xlargeImageUrl: S3_BASE_URL + 'Gdsharp1200x800.png'
  },
},
  A: {
    doubleflat: {
      largeImageURL: S3_BASE_URL + 'Adflat1024x600.png',
      smallImageURL: S3_BASE_URL + 'Adflat720x480.png',
      xlargeImageUrl: S3_BASE_URL + 'Adflat1200x800.png'
  },
    flat: {
      largeImageURL: S3_BASE_URL + 'Aflat1024x600.png',
      smallImageURL: S3_BASE_URL + 'Aflat720x480.png',
      xlargeImageUrl: S3_BASE_URL + 'Aflat1200x800.png'
  },
    natural: {
      largeImageURL: S3_BASE_URL + 'A1024x600.png',
      smallImageURL: S3_BASE_URL + 'A720x480.png',
      xlargeImageUrl: S3_BASE_URL + 'A1200x800.png'
  },
    sharp: {
      largeImageURL: S3_BASE_URL + 'Asharp1024x600.png',
      smallImageURL: S3_BASE_URL + 'Asharp720x480.png',
      xlargeImageUrl: S3_BASE_URL + 'Asharp1200x800.png'
  },
    doublesharp: {
      largeImageURL: S3_BASE_URL + 'Adsharp1024x600.png',
      smallImageURL: S3_BASE_URL + 'Adsharp720x480.png',
      xlargeImageUrl: S3_BASE_URL + 'Adsharp1200x800.png'
  },
},
  B: {
    doubleflat: {
      largeImageURL: S3_BASE_URL + 'Bdflat1024x600.png',
      smallImageURL: S3_BASE_URL + 'Bdflat720x480.png',
      xlargeImageUrl: S3_BASE_URL + 'Bdflat1200x800.png'
  },
    flat: {
      largeImageURL: S3_BASE_URL + 'Bflat1024x600.png',
      smallImageURL: S3_BASE_URL + 'Bflat720x480.png',
      xlargeImageUrl: S3_BASE_URL + 'Bflat1200x800.png'
  },
    natural: {
      smallImageUrl: S3_BASE_URL + 'B720x480.png',
      largeImageUrl: S3_BASE_URL + 'B1024x600.png',
      xlargeImageUrl: S3_BASE_URL + 'B1200x800.png'
  },
    sharp: {
      largeImageURL: S3_BASE_URL + 'Bsharp1024x600.png',
      smallImageURL: S3_BASE_URL + 'Bsharp720x480.png',
      xlargeImageUrl: S3_BASE_URL + 'Bsharp1200x800.png'
  },
    doublesharp: {
      largeImageURL: S3_BASE_URL + 'Bdsharp1024x600.png',
      smallImageURL: S3_BASE_URL + 'Bdsharp720x480.png',
      xlargeImageUrl: S3_BASE_URL + 'Bdsharp1200x800.png'
  }
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
   //const startSpeech = "Welcome to Music Drone. What note would you like? \
   //You can say things like G natural, or F sharp.";
   
   //const startReprompt = "What note would you like?";
   this.emit(':ask', startSpeech, startReprompt);
    
    //this.emit(':responseReady');
    //this.emit('PlayStream');
  },
  'GetPitchIntent': function() {

    //Get pitch, multiplier and accidental and translate them to a standard format.
    // pitch is var rather than const because some cleanup code later translates
    // common Alexa misunderstandings in pitch letters
    const pitchValue = this.event.request.intent.slots.pitch.value;
    var pitch = (pitchValue || '').trim().toUpperCase().replace(/[^A-Z]/g, '').charAt(0);
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

      //This translates common pitch soundalikes
      if (pitch == 'S') {
        pitch = 'C';
      }
      if (pitch == 'T') {
        pitch = 'D';
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
    else if (['flat', 'natural', 'sharp', '4', '40'].indexOf(accidental) === -1) {
      
      var badAccidental = noteRequested + '. The accidental must be flat, \
      sharp or natural. What note would you like?.';
      
      this.emit(':ask', badAccidental, badAccidental);
    }
    
    // validate that the user gave a valid multiplier
   
    else if (multiplier !== '' && ['double', '4'].indexOf(multiplier) === -1) {
      var badMultiplierText = noteRequested + '. If you use three words to describe your note, \
      the second word must be double, or you may specifically ask for an Ay 4 40. \
      So you can say something like C double \
      flat, or F double sharp, or Ay 4 40. What note would you like?';
      const outTest =  pitch + ' ' + multiplier + ' ' + accidental;
      this.emit(':ask', badMultiplierText,badMultiplierText);
    }

     // validate that the user didn't say "double natural"
    else if (multiplier === 'double' && accidental === 'natural') {
     
      var badCombinationText = noteRequested + '. Notes cannot be \
       double natural. ' + 'What note would you like?';
      
      this.emit(':ask', badCombinationText, badCombinationText);
    }

    //If all checks are passed then play the note and output to card/template
    else {

        //Construct spoken output. If pitch is A have Alexa pronounce it as AY
        var pitchSpeech
        if (pitch == 'A'){
          pitchSpeech = 'AY';
        }
        else {
          pitchSpeech = pitch;
        }
        const speechOutput = 
          pitchSpeech 
          + (multiplier ? ' ' + multiplier : '')
          + (accidental === 'natural' ? '' : ' ' + accidental);
        
          
        //Construct sound file URL - Check for special case of A440
        if (['4', '40'].indexOf(accidental) === -1){
          audioURL = SOUNDCLOUD_BASE_URL + pitchSoundcloudEndUrl[pitch][multiplier + accidental];
        }
        else {
          audioURL = SOUNDCLOUD_BASE_URL + '/A440.mp3';
        }

        //Construct image file URL - Check for special case of A440
        if (['4', '40'].indexOf(accidental) === -1){
          imgURL = S3_BASE_URL + imgEndUrl[pitch][multiplier + accidental];
        }
        else {
          imgURL = S3_BASE_URL + 'A440.png';
        }

        //Construct printed output. Check for special case of A440
        var pitchChar;
        if (['4', '40'].indexOf(accidental) === -1) {
          pitchChar = pitch + accidentalToChar[multiplier + accidental];
        }
        else {
          pitchChar = 'A440';
        }

        const txtOutput = pitchChar + ' ' + audioURL + ' ' + imgURL;
        //audioURL = ''; //clear this so it doesn't remain in next pass
        
        //Output to card/template and voice
        if (supportsDisplay.call(this))
        {
          // values used in rendering the body template for Show
          const makeImage = Alexa.utils.ImageUtils.makeImage;
          var imgAddress = imgEndUrl[pitch][multiplier + accidental].xlargeImageUrl;
          //var imgAddress = "https://s3.amazonaws.com/ericcricketsnvirginia/csharpviolin1200x800.PNG";

             const bodyTemplate7 = new Alexa.templateBuilders.BodyTemplate7Builder();
                         
                          var template = bodyTemplate7.setTitle("Playing " + txtOutput)
                                              .setImage(makeImage(imgAddress))
                                              .build();
                                              
                          this.response.renderTemplate(template)
                                              .shouldEndSession(null); 
        }
        else {
         
         
          this.response.cardRenderer('Now Playing: ' + pitchChar, 'Thank you for using Music Drone!', imgEndUrl[pitch][multiplier + accidental]);
          
        }
        this.response.speak(speechOutput).audioPlayerPlay('REPLACE_ALL', audioURL, 1, null, 0);
        console.log();
        //this.response.speak(speechOutput);
        this.emit(':responseReady');
    }
  },

 
  'PlayStream': function() {
    
    //if (!audioURL) {
      const againText = 'Sorry, I didn\'t understand your request. ' + startSpeech;  
      this.emit(':ask', againText, startReprompt);
    //}
    /*
    else {
      this.response.cardRenderer('OK', audioURL);
      this.response.speak('URL is:' + audioURL);
      //audioURL = 'https://streaming.radionomy.com/RadioXUS?lang=en-US&appName=iTunes.m3u';
      //this.response.speak('Here').audioPlayerPlay('REPLACE_ALL', audioURL, audioURL, null, 0);
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
    
    if (supportsDisplay.call(this))
{
    // values used in rendering the body template for Show
     const makeImage = Alexa.utils.ImageUtils.makeImage;
     var imgAddress = "https://s3.amazonaws.com/ericcricketsnvirginia/drone/signoff1200x800.png";
     const bodyTemplate7 = new Alexa.templateBuilders.BodyTemplate7Builder();
                  
                  var template = bodyTemplate7.setTitle("Thank you for using Pitch Drone.")
                                      .setImage(makeImage(imgAddress))
                                      .build();
                                      
                  this.response.renderTemplate(template)
                                      .shouldEndSession(null);
}
else {
  this.response.cardRenderer('Hope you had a good practice!', 'Thank you for using Pitch Drone! \
  Your reviews help guide us in developing better tools. Please don\'t hesitate to\
contact us at gentleechodesigns@gmail.com', streamInfo.image);
}


    //output response including card, speech and audio
    
   // this.response.speak(speechOutput).audioPlayerStop();
    //this.emit(':responseReady');
    
    
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
    this.response.audioPlayerPlay('REPLACE_ALL', audioURL, audioURL, null, 0);
    //this.response.audioPlayerPlay('REPLACE_ALL', streamInfo.url, streamInfo.url, null, 0);
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

function makeTemplate(tempPitchChar, tempPitch, tempMultiplier, tempAccidental){

  if (supportsDisplay.call(this))
  {
    
       const bodyTemplate7 = new Alexa.templateBuilders.BodyTemplate7Builder();
                    var tempTitle = 'Now Playing ' + tempPitchChar;
                    var template = bodyTemplate7.setTitle(tempTitle)
                                        .setImage(makeImage(streamInfo.image))
                                        .build();
                                        
                    this.response.renderTemplate(template)
                                        .shouldEndSession(null);
  }
  else {
    this.response.cardRenderer(tempTitle, tempPitchChar, streamInfo.image);
  }
return;
}