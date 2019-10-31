//Remember to look at the ResponseCode lists
//https://developer.mozilla.org/en-US/docs/Web/HTTP/Status

//App template code to make it work
var express = require("express"),
  http = require("http"),
  path = require("path"),
  routes = require("./routes"),
  favicon = require("favicon"),
  exphbs = require("express-handlebars"),
  morgan = require("morgan");
const { URL, URLSearchParams } = require("url");

const fetch = require("node-fetch");
var app = (module.exports = express());
var hbs = exphbs.create({ layoutsDir: __dirname + "/views" });
app.set("port", process.env.PORT || 3000);
app.engine("handlebars", hbs.engine);
app.set("views", __dirname + "/views");
app.set("view engine", "handlebars");
app.use(morgan("combined"));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
next();
});

//setting a bunch of custom headers at once
app.get("/", (req, res, next) => {
  //the HTTP method
  res.set({
    "content-type": "application/json"
  });

  let response = {
    "business-name": "",
    distance: "",
    category: "",
    rating: "",
    "price-point": ""
  };

  res.status(200).json(response);
});

app.get("/yelp", async (req, res) => {
  //another endpoint

  res.set({
    "content-type": "application/json"
  });

  //const url = "https://api.yelp.com/v3/businesses/search?term=food&latitude=40.728684&longitude=-73.990246";

  const url = new URL("https://api.yelp.com/v3/businesses/search");
  const params = {
    term: "food",
    latitude: 40.728684,
    longitude: -73.990246
  };

  url.search = new URLSearchParams(params);

  const requestConfig = {
    headers: {
      Authorization: `Bearer ${process.env.YELP}`
    }
  };
  let request = await fetch(url, requestConfig);
  const responses = await request.json();

  const formatted_responses = responses.businesses.map(response => {
    return {
      businessName: response.name,
      img: response.image_url
    };
  });

  //   let response = {
  //     businessName: raw_response.businesses[0].name,
  //     distance: "",
  //     category: "",
  //     rating: "",
  //     pricePoint: ""
  //   };

  res.status(200).json(formatted_responses);
});

app.get("/search", routes.determine_service, routes.search);

app.get("/yelp_detail", routes.yelp_detail);


app.get("/heroku_test", async (req, res) => {
  res.json({test:"test"})
  
})

//business details endpoint
app.get("/business", async (req, res) => {
  const id = req.param("id");
  const locale = req.param("locale")
  const url = `https://api.yelp.com/v3/businesses/${id}`
  const requestConfig = {
    headers: {
      Authorization: `Bearer ${process.env.YELP}`
    }
  };
  
  if (locale) {
    url += `&locale=${locale}`
  }
  console.log(url)
  let request = await fetch(url, requestConfig);
  const response = await request.json();
  res.status(200).json(response);
});

app.post("/", (req, res) => {
  res.end("hi there!");
});

app.post("/protected", (req, res) => {
  console.log(req.headers);

  if ("api_key" in req.headers && req.headers.api_key == process.env.YELP) {
    console.log("yay correct api key");
    res.status(200).end("hi there!");
  } else {
    console.log(`INVALID API KEY: ${req.headers.api_key}`);

    res.status(403).end("Denied!");
  }
});

//an example that uses the views/template.handlebars file for html rendering
app.get("/template", (req, res) => {
  var path = "about";
  res.render("request", {
    title: "Serving a real template",
    name: path,
    description: "Sample links for Glitch",
    examples: [
      {
        url: "",
        title: ""
      }
    ]
  });
});

//start the app
http.createServer(app).listen(app.get("port"), function() {
  console.log("Server listening on port: " + app.get("port"));
});
