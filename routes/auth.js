var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');


const app = express();
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.get('/', function (req, res){
  res.render('auth', {title:"LOGIN", MESSAGE:"Please login"});
})


app.post('/', async (req, res) => {

  try {

    const User = req.app.get('User');
    console.log(req.body);
    const newUser = new User(req.body)
    await newUser.save()    
    res.json({ user: newUser });
  
  } catch(error) {
    console.error(error)
  }
  
  })

module.exports = app;
