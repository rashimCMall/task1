var express = require('express');
var morgan = require('morgan');
var passport = require('passport');

const app = express();
app.use(morgan('dev'));
app.use(express.urlencoded({extended:false}));
app.use(express.json());

app.get('/', function (req, res){
  res.render('auth', {title:"LOGIN", MESSAGE:"Please login"});
})

app.post('/save', async (req, res) => {

  try {
    const User = req.app.get('User');
    console.log(req.body);
    const newUser = new User(req.body)
    await newUser.save()    
    res.json({ user: newUser });

  } catch(error) {
    console.error(error);
  }
})

app.post('/', passport.authenticate('local'), (req, res) => {
  const { user } = req
  res.json(user);
});

app.post('/reset', (req, res) => {
  
  try {
    const User = req.app.get('User');
    const username = req.body.username;
    const old_password = req.body.old_password;
    const new_password = req.body.password;

    User.findOne({ where:{ username: username }}).then(user => {
      if (!user) {
        res.send('Incorrect Username');
      }
      if (user.password !== old_password) {
        res.send('Incorrect Password');
      }
      User.update(
        { password: new_password },
        { where: { username : user.username } }
      )  
      .then(result => {
        res.send('Password changed successfully');
      })
      .catch(err => {
        res.send('ERROR!!:',err);
      });

    }).catch(err => { 
      res.send('Error while changing password:',err);
    });

  } catch(err) {
    res.send(req.body);
  }
});



module.exports = app;