const passportLocal = require("passport-local").Strategy;
const mongoose = require("mongoose");
const bycrpt = require("bcryptjs");

// Load User Model
const User = require("../models/Users");

module.exports = function (passport) {
  passport.use(
    new passportLocal({ usernameField: "email" }, (email, password, done) => {
      // Match User
      User.findOne({ email: email })
        .then((user) => {
          if (!user) {
            return done(null, false, { message: "Email does not exit" });
          }

          // Matching password
          bycrpt.compare(password, user.password, (err, isMatch) => {
            if (err) throw err;
            if (isMatch) {
              return done(null, user);
            } else {
              return done(null, false, {
                message: "Password incorrect",
              });
            }
          });
        })
        .catch((err) => console.log(err));
    })
  );
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });
};
