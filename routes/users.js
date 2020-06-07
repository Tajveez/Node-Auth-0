const express = require("express");
const bcrypt = require("bcryptjs");
const passport = require("passport");

const router = express.Router();

// User Model
const User = require("../models/Users");

// Login page
router.get("/login", (req, res) => {
  let errors = [];
  res.render("login");
});

// Register Page
router.get("/register", (req, res) => {
  let errors = [];
  res.render("register", { errors });
});

// Register Handle
router.post("/register", (req, res) => {
  console.log(req.body);
  const { name, email, password, password2 } = req.body;
  let errors = [];

  // Validation
  if (!name || !email || !password || !password2) {
    errors.push({
      msg: "Please, fill in all fields",
    });
  }

  if (password !== password2) {
    errors.push({
      msg: "Passwords don't match",
    });
  }

  if (password.length < 6) {
    errors.push({
      msg: "Passwords should be at least 6 characters",
    });
  }
  if (errors.length > 0) {
    res.render("register", {
      errors,
      name,
      email,
      password,
      password2,
    });
  } else {
    User.findOne({ email: email }).then((user) => {
      if (user) {
        errors.push({
          msg: "Email is already registered",
        });
        res.render("register", {
          errors,
          name,
          email,
          password,
          password2,
        });
      } else {
        const user = new User({
          name,
          email,
          password,
        });

        bcrypt.genSalt(10, (err, salt) =>
          bcrypt.hash(user.password, salt, (err, hash) => {
            if (err) throw err;
            user.password = hash;
            // Saving user
            user
              .save()
              .then((user) => {
                req.flash(
                  "success_msg",
                  "Registration successful, you can login now!"
                );
                res.redirect("login");
              })
              .catch((err) => console.log(err));
          })
        );
      }
    });
  }
});

// Login handle with Passport
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true,
  })(req, res, next);
});

// Logout handle
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_msg", "You are Logged out");
  res.redirect("login");
});

module.exports = router;
