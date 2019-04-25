var express = require("express");
var path = require("path");
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var expressValidator = require('express-validator');
var config = require('./config/database');
var fileUpload = require('express-fileupload');
 mongoose.connect(config.database, { useNewUrlParser: true });




var db = mongoose.connection;
db.on('error',console.error.bind(console,'connection error '));
db.once('open',function(){
  console.log("connect");
});

app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');
app.use(express.static(path.join(__dirname,'public')));

app.locals.errors = null;

var Page = require('./models/page');

Page.find({}).sort({sorting:1}).exec(function(err,pages){
  if(err){
    console.log(err);
  }
  else{
    app.locals.pages=pages;
  }
});

var Category = require('./models/category');

Category.find(function(err,categories){
  if(err){
    console.log(err);
  }
  else{
    app.locals.categories=categories;
  }
});




app.use(fileUpload());
//body parser
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

//express session
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}))

//express validator

app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  },
  customValidators:{
    isImage: function(value,filename){
      var extension = (path.extname(filename)).toLowerCase();
      switch (extension){
        case '.jpg':
        return '.jpg';

        case '.jpeg':
        return '.jpeg';
        case '.png':
        return '.png';
        case '':
        return '.jpg';
        default:
        return false;

      }
    }
  }
}));

//express messages
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

app.get('*',function(req,res,next){
  res.locals.cart = req.session.cart;
  next();

});


var pages=require('./routes/pages.js');
var products=require('./routes/products.js');
var cart=require('./routes/cart.js');
var adminPages=require('./routes/admin_pages.js');
var adminCategories=require('./routes/admin_categories.js');
var adminProducts=require('./routes/admin_products.js');

app.use('/admin/pages',adminPages);
app.use('/admin/categories',adminCategories);
app.use('/admin/products',adminProducts);
app.use('/products',products);
app.use('/cart',cart);

app.use('/',pages);

var port = 3000;
app.listen(port,function(){
console.log("server is runnning on port"+port);

})
