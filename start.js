var express = require('express');
var bodyParser = require('body-parser');
var request = require('request')
var cheerio = require('cheerio')


var app = express();

garages = [];

getGarages = function() {
  var r;
  r = request('https://secure.parking.ucf.edu/GarageCount/iframe.aspx/', function(error, response, body) {
    var $, 
    $ = cheerio.load(body);
    $('.dxgvDataRow_DevEx').each(function(i, obj) {
      var html, j, len, line, percent, thisGarage;
      thisGarage = {};
      html = $(obj).html().replace(RegExp(' ', 'g'), '').split('\n');
      for (j = 0, len = html.length; j < len; j++) {
        line = html[j];
        if (line.indexOf("percent:") === 0) {
          percent = parseInt(line.replace("percent:", ''));
          thisGarage.perc = percent;
        }
      }
      thisGarage.garage = ($(obj).find('.dxgv').html()).replace("Garage ", '');
      garages[i] = thisGarage;
    });
  });
  return garages;
};

getGarages();
app.use(express.static("static"));
app.use("/wakemeup.css", express.static(__dirname + "/wakemeup.css"));

//Serve that index page, Sam!
app.get('/', function(req, res) {
	res.sendfile('index.html');
});

app.set('port', (process.env.PORT || 5000));

app.get('/api/garage', function(request, response) {
	getGarages();
	response.json(garages);
});

app.get('/api/weather', function(req, response) {
	request("http://api.openweathermap.org/data/2.5/weather?zip={{ZIP}},us&APPID={{APIKEY}}&units=imperial", function(err, res, body ){
		response.json(body);
	});
});

app.get('/api/coffee', function(req, response){
	request("https://maker.ifttt.com/trigger/knighthacks/with/key/mih3J02srpLqqPiJVSThHaBmccenWNYZl1gdYsP6bwE", function(err, res, body ){
		//lol i don't actually need to do anything here.  How are you doing today?  Hope it's well!
	});
});
					
				
app.get('/api/pubsub', function(req, response) {
	yesResponses = ["They're back, baby!", "Yes they are!", "Get your butt to Publix!", "Yes.  Yes they are.", "They are, until they aren't.  Hurry!", "chickentendersub.onSale = true"]
	noResponses = ["Sorry to disappoint.", "Not right now, unfortunately.", "Hate to be the bearer of bad news...", "Nope.", "Don't shoot the messenger bot, but no.", "Not at this time.", "Outlook seems dim.", "Maybe next week."]

	request('http://www.arepublixchickentendersubsonsale.com/', function(error, res, body){
		$ = cheerio.load(body);
		if($.html().indexOf("onsale:yes") != -1){
			response.json({sale: true, string: yesResponses[Math.floor(Math.random()*yesResponses.length)]});
		}
		else{
			response.json({sale: false, string: noResponses[Math.floor(Math.random()*noResponses.length)]});
		}
	});

});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});