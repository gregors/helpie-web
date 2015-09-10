var express = require('express');
var getRawBody = require('raw-body');
var wit = require('node-wit');
var fs = require('fs');
var streamifier = require('streamifier');

var models = require('./models');

var ACCESS_TOKEN = 'EEBIDF2KTIIDA574WDZP7NUYPSVLG6IG';

const app = express();

const server = app
  .post('/checkins', function(request, response) {
    var responseText = "";
    getRawBody(request, {
    }, function (err, string) {
      if (err) {
        response.end('ERROR!');
      }
      responseText = responseText + 'Upload length = ' + string.length;

      var stream = streamifier.createReadStream(string);
      wit.captureSpeechIntent(ACCESS_TOKEN, stream, "audio/wav", function (err, res) {
        responseText = responseText + "Response from Wit for audio stream: ";
        if (err) response.end("Error: ", err);
        responseText = responseText + JSON.stringify(res, null, " ");
        models.CheckIn.create({name: 'a-test', location: 'this place', audio: string}).then(function(checkIn){
          responseText = responseText + "SAVED";
          response.end(responseText);
        })
        .catch(function(error) {
          response.end(errror);
        });;
      });
    })
  })
  .get('/checkins/:id/audio', function(request, response) {
    models.CheckIn.findById(request.params.id)
      .then(function(checkIn) {
        response.set('Content-Type', 'audio/wav');
        response.send(checkIn.audio);
      });
  })
  .get('/checkins', function(request,response) {
    models.CheckIn.findAll().then(function(checkIns) {
      responseText = "<ul>";
      checkIns.forEach(function(checkIn) {
        responseText = responseText + "<li>" + checkIn.id + "</li>";
      });
      responseText = responseText + "</ul>";
      response.end(responseText);
    });
  });

var port = process.env.PORT || 3000;
server.listen(port, function() {
  console.log('Server listening on port ' + port + '...');
});
