var express = require('express');
var router = express.Router();
var Product = require('../models/product');


router.get('/add/:product',function(req,res){
    var slug = req.params.product;

  Product.findOne({slug:slug},function(err,p){
 if(err){
   console.log(err);
 }
 if(typeof req.session.cart == "undefined"){

   req.session.cart = [];
   req.session.cart.push({
     title:slug,
     qty:1,
     price:parseFloat(p.price).toFixed(2),
     image:'/product_images/'+p._id+'/'+p.image
   });
 }else{
   var cart = req.session.cart;
   var newitem = true ;
   for(var i=0; i<cart.length ;i++){
     if( cart[i].title==slug){
       cart[i].qty++;
       //console.log(qty);
       newitem=false;
       break;
     }
   }
   if(newitem){
     cart.push({
       title:slug,
       qty:1,
       price:parseFloat(p.price).toFixed(2),
       image:'/product_images/'+p._id+'/'+p.image
     });
   }
 }

 console.log(req.session.cart);
 req.flash('success','product added');
 res.redirect('back');
  });
});

router.get('/checkout',function(req,res){
     res.render('checkout',{
       title:checkout,
       cart:req.session.cart
     } );
});





module.exports=router;
