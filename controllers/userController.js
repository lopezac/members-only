const { body, validationResult } = require("express-validator");
const passport = require("passport");
const bcrypt = require("bcryptjs");

const User = require("../models/user");

exports.signUpGet = (req, res, next) => {
  res.render("signUp", { title: "Sign Up" });
};

exports.signUpPost = [
  body("firstName", "First name must not be empty")
    .trim()
    .isLength({ min: 3, max: 60 })
    .escape(),
  body("lastName", "Last name must not be empty")
    .trim()
    .isLength({ min: 3, max: 60 })
    .escape(),
  body("username", "Username must not be empty")
    .trim()
    .isLength({ min: 5, max: 100 })
    .escape(),
  body("password", "Password must not be empty").trim().isLength({ min: 7 }),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Password and password confirmation do not match");
    }
    return true;
  }),
  body("membership", "Must select a membership status").toBoolean(),
  (req, res, next) => {
    const errors = validationResult(req);

    const user = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      username: req.body.username,
      password: req.body.password,
      membership: req.body.membership,
    });

    if (!errors.isEmpty()) {
      console.log(req.body.membership);
      return res.render("signUp", {
        title: "Sign Up",
        user,
        confirmPassword: req.body.confirmPassword,
        errors: errors.array(),
      });
    }

    bcrypt.genSalt(10, function (err, salt) {
      if (err) return next(err);
      bcrypt.hash(user.password, salt, function (err, hashedPassword) {
        if (err) return next(err);
        user.password = hashedPassword;
        user.save((err) => {
          if (err) return next(err);
          res.redirect("/");
        });
      });
    });
  },
];

exports.signInGet = (req, res, next) => {
  res.render("signIn", { title: "Sign In" });
};

exports.signInPost = passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/sign-in",
});

exports.signOutPost = (req, res, next) => {
  req.logout(function (err) {
    if (err) next(err);
    res.redirect("/");
  });
};
