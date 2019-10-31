const fetch = require("node-fetch");

const yelp = () => {
  
}


exports.search = async (req, res) => {
  //root search request

  //parameters
  
  console.log("search service is", req.searchService)
  
  if("searchService" in req) {
    console.log("middleware added search service", req.searchService)
  }

  // var parameters = {
  //   term: req.param("term"),
  //   latitude: req.param("latitude"),
  //   longitude: req.param("longitude"),
  //   location: req.param("location"),
  //   radius: req.param("radius"),
  //   categories: req.param("categories"),
  //   locale: req.param("locale"),
  //   limit: req.param("limit"),
  //   offset: req.param("offset"),
  //   sort_by: req.param("sort_by"),
  //   price: req.param("price"),
  //   open_now: req.param("open_now"),
  //   open_at: req.param("open_at"),
  //   attributes: req.param("attributes")
  // }
  
  const valid_params = ['term','latitude','longitude','location','radius','categories','locale','limit','offset','sort_by','price','open_now','open_at','attributes'] //add parameters
  
  let parameters = {}
  valid_params.forEach((param)=>{
    parameters[param] = req.query[param]
  })
  
  console.log(parameters)
  
  res.set({
    "content-type": "application/json"
  });

  //construct request url
  const rootUrl = "https://api.yelp.com/v3/businesses/search?";
  var url = rootUrl;
  Object.keys(parameters).forEach(function (param) {
    if (parameters[param]){
      url = url + `&${param}=${parameters[param]}`
    }
  })
  
  console.log(url)
    
  
  const requestConfig = {
    headers: {
      Authorization: `Bearer ${process.env.YELP}`
    }
  };
  let request = await fetch(url, requestConfig);
  const responses = await request.json();
  
  const formatted_responses = responses.businesses.map(response => {
    return {
      id: response.id || "",
      businessName: response.name || "",
      img: response.image_url || "",
      isClosed: response.is_closed,
      //categories: response.categories,
      rating: response.rating || 0, 
      latitude: response.coordinates.latitude,
      longitude:response.coordinates.longitude,
      price: response.price || "?",
      address: response.location.display_address || ""
    };
  });

  //const randomizedItemId = formatted_responses[Math.floor(Math.random()*formatted_responses.length)].id

  //req.id = 
  //next()
  
  res.status(200).json(formatted_responses);
  //res.status(200).json(responses);
  
};

exports.require_api_key = (req, res, next) =>{
  console.log(req.headers);

  if ("api_key" in req.headers && req.headers.api_key == process.env.YELP) {
    console.log("yay correct api key");
    // res.status(200).end("hi there!");
    next()
  } else {
    console.log(`INVALID API KEY: ${req.headers.api_key}`);

    res.status(403).end("Denied!");
  }
}

exports.determine_service = (req, res, next) => {
  
  req.searchService = 'yelp'
  next()
}


exports.yelp_detail = async (req, res) => {
  const valid_params = ['id','locale'] //add parameters
  
  
  
  let parameters = {}
  valid_params.forEach((param)=>{
    parameters[param] = req.query[param]
  })
  
  console.log(parameters)
  
  res.set({
    "content-type": "application/json"
  });

  //construct request url
  const rootUrl = "https://api.yelp.com/v3/businesses/";
  var url = rootUrl + parameters.id + `?locale=${parameters.locale}`;
  
//   url = url + parameters.id ;
  
//   Object.keys(parameters).forEach(function (param) {
//     if (parameters[param]){
//       url = url + `&${param}=${parameters[param]}`
//     }
//   })
  
  console.log(url)
    
  
  const requestConfig = {
    headers: {
      Authorization: `Bearer ${process.env.YELP}`
    }
  };
  let request = await fetch(url, requestConfig);
  const response = await request.json();
  
  const formatted_response = {
      id: response.id || "error",
      businessName: response.name || "",
      img: response.image_url || "",
      isClosed: response.is_closed,
      //categories: response.categories,
      rating: response.rating || 0, 
      latitude: response.coordinates.latitude,
      longitude:response.coordinates.longitude,
      price: response.price || "?",
      address: response.location.display_address || "",
      photos: response.photos || ["https://fys.kuleuven.be/iks/images/empty.png/image"],
      categories: ["Test 1", "Test 2"]
    };
  


  res.status(200).json(formatted_response);
  
};