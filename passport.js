var LocalStrategy = require('passport-local').Strategy;

module.exports = function(passport, User) {
    passport.use(new LocalStrategy((username, password, done) => {

        User.findOne({ where:{ username: username }}).then(user => {
        if (!user) {
            return done(null, false, { message: 'Incorrect username.' });
        }
        if (user.password !== password) {
            return done(null, false, { message: 'Incorrect password.' });
        }
        done(null, user);

        }).catch(err => { 
            done(err);
        });
    }))

    passport.serializeUser((user, done) => {done(null, user); });
    passport.deserializeUser((user, done) => {done(null, user); });
};