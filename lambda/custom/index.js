'use strict';

var Alexa = require('alexa-sdk');

Alexa.APP_ID = 'amzn1.ask.skill.092aa3ec-992f-446a-8c5f-9996a5075459';

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
    this.emit('PlayStream');
  },
  'GetPitchIntent': function() {

       
    const pitchValue = this.event.request.intent.slots.pitch.value;
    const pitch = (pitchValue || '').trim().toUpperCase().replace(/[^A-G]/g, '').charAt(0);
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

      const speechOutput = 
     // message 
      pitch 
      + (multiplier ? ' ' + multiplier : '')
      + (accidental === 'natural' ? '' : ' ' + accidental)

    this.response.speak(speechOutput);
  this.emit(':responseReady');
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
    // skill help logic goes here
    this.emit(':responseReady');
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
    this.response.speak('Okay. I\'ve stopped the stream.').audioPlayerStop();
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
