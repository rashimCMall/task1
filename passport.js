var LocalStrategy = require('passport-local').Strategy;

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


module.exports = function(passport, client) {

    passport.use(new LocalStrategy((username, password, done) => {
        
        check_entry(client, username, password, (is_user_valid, is_pass_valid) => {

            if(!is_user_valid) {
                done(null, false);
            } else if(!is_pass_valid) {
                done(null, false);
            } else {
                done(null, { username: username, password: password })
            }
        });
    }));

    passport.serializeUser((user, done) => {done(null, user.username); });
    passport.deserializeUser((username, done) => {
        
        const select_query = 
        `SELECT username, password 
         FROM users 
         WHERE username = '${username}'`;

        client.query(select_query, (err, res) => {
            if(err) {
                console.error('ERROR while selecting user on session deserialize',err);
                done(err);
            } else {
                done(null, res.rows[0].username);
            }
        });
    });
};