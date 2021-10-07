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


function duplicate_entry(client, username, cb) {

  const find_query =  `
  SELECT *
  FROM users
  WHERE username = '${username}'`;

  let is_dup = false;
  client.query(find_query, (err, res) => {
    if (err) {
        console.error(err);
        return;
    }

    if(res.rowCount != 0) {
      is_dup = true;
    }
    cb(is_dup);
  });
}


app.post('/save', async (req, res) => {

  try {
    const client = req.app.get('client');
    
    duplicate_entry(client, req.body.username, (is_dup) => {
      if(is_dup) {
        return res.send('Username is already taken. Please try again');
      }
      else {
        const insert_query = `
        INSERT INTO users (username,password)
        VALUES ('${req.body.username}','${req.body.password}');`;
        
        client.query(insert_query, (err, res) => {
          if (err) {
              console.error(err);
              return;
          }
        });   
        return res.send('Account creation successful');
      }
    });

  } catch(error) {
    console.error(error);
  }
});


app.post('/', passport.authenticate('local'), (req, res) => {
  const { user } = req
  res.json(user);
});


function check_entry(client, username, password, cb) {

  select_query = `
  SELECT *
  FROM users
  WHERE username = '${username}'
  ;` 
  let is_pass_valid = true;
  let is_user_valid = true;
  client.query(select_query, (err, res) => {
    if(err) {
        console.error(err);
        return;
    }
    if(res.rowCount != 1) {
      is_user_valid = false;
    }
    if(res.rowCount == 1 && res.rows[0].password != password) {
      is_pass_valid = false;
    }
    cb(is_user_valid, is_pass_valid);
  });
}


app.post('/reset', (req, res) => {
  
  try {
    const client = req.app.get('client');
    const username = req.body.username;
    const old_password = req.body.old_password;
    const new_password = req.body.password;

    check_entry(client, username, old_password, (is_user_valid, is_pass_valid) => {

      if(!is_user_valid) {
        return res.send('Username not found');
      }
      if(!is_pass_valid) {
        return res.send('Password is incorrect');
      }

      update_query = `
      UPDATE users
      SET password = '${new_password}'
      WHERE username = '${username}'
      ;` 

      client.query(update_query, (err, result) => {
        if(err) {
            console.error(err);
            return;
        }
        return res.send('Password change successful');
      });

    });

  } catch(err) {
    return res.send(req.body);
  }
});

app.post('/delete', (req, res) => {
  
  try {
    const client = req.app.get('client');
    const username = req.body.username;
    const password = req.body.password;

    check_entry(client, username, password, (is_user_valid, is_pass_valid) => {

      if(!is_user_valid) {
        return res.send('Username not found');
      }
      if(!is_pass_valid) {
        return res.send('Password is incorrect');
      }

      delete_query = `
      DELETE FROM users
      WHERE username = '${username}'
      ;`; 

      client.query(delete_query, (err, result) => {
        if(err) {
            console.error(err);
            return;
        }
      });
      return res.send('Account deletion successful');
    });

  } catch(err) {
    return res.send(req.body);
  }
});

module.exports = app;