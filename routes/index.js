var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.json({message: 'alive'});
});

router.get('/about', function(req, res){
  res.send('got a post request');
});

module.exports = router;
