const express = require('express');
const cors = require('cors')
const app = express();
const path = require("path");
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require("cookie-parser");

var formidable = require('formidable');
app.use(cors());
app.use(cookieParser());


/*app.use(express.static(__dirname + 'public'));*/
//trying to fix css/js not loading with this issue
//app.use(express.static(path.join(__dirname, 'client')));
//The Access-Control-Allow-Origin response header indicates whether the response can be shared with requesting code from the given origin.

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
})
//bodyParser:express
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
//app.use("/client", express.static(path.resolve(__dirname + "/../client/")));

//----------------NEW 2/27/22-------------------------
const oneDay = 1000 * 60 * 60 * 24;
app.use(session({
  //have to specify resave and saveUnitialized options 
  name:'sessionTest',
  secret: 'secretVar',
  cookie: { maxAge: oneDay, secure:false },
  resave:false,
  saveUnitialized:false, 
}));

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,'static')));

//make the server
var server;
var port = process.env.PORT || process.env.NODE_PORT || 5000;

//Page listeners
var router = require("./router.js");
router(app);

//Service listeners - MySQL
var services = require("./services.js");
//const { apiDefineProperty } = require('mobx/dist/internal');
services(app);

//listen
server = app.listen(port, function(err) {
    if (err) {
      throw err;
    }
    console.log("Listening on port " + port);
});
