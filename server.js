var express = require("express");
var mongojs = require("mongojs");

var cheerio = require("cheerio");
var axios = require("axios");

// present the home page with scrape 
//when scrape button is pressed use cheerio to request articles
//add articles to mongo database
//render articles with add note button and delete note button

var app = express();

var databaseUrl = "scraper";
var collections = ["scrapedData"];

// Hook mongojs configuration to the db variable
var db = mongojs(databaseUrl, collections);
db.on("error", function(error) {
  console.log("Database Error:", error);
});



// Main route 
app.get("/", function(req, res) {
  res.send("News Scraper");
});

app.get("/scrape", function(req, res){

    axios.get("https://fair.org/").then(function(response) {
    // Load the html body from axios into cheerio
    var $ = cheerio.load(response.data);

    console.log(response.data);

    $(".title").each(function(i, element) {
        // Save the text and href of each link enclosed in the current element
        var title = $(element).children("a").text();
        var link = $(element).children("a").attr("href");
  
        // If this found element had both a title and a link
        if (title && link) {
          // Insert the data in the scrapedData db
          db.scrapedData.insert({
            title: title,
            link: link
          },
          function(err, inserted) {
            if (err) {
              // Log the error if one is encountered during the query
              console.log(err);
            }
            else {
              // Otherwise, log the inserted data
              res.render(response.data);
              console.log(inserted);
            }
          });
        }
      });
    });
  
    // Send a "Scrape Complete" message to the browser
    res.send("Scrape Complete");
  });



app.listen(3000, function() {
    console.log("App running on port 3000!");
  });
  