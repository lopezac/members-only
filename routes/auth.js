const LocalStrategy = require("passport-local").Strategy;
const passport = require("passport");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");

const User = require("../models/user");
const userController = require("../controllers/userController");

// Passport logic
passport.use(
  new LocalStrategy((username, password, cb) => {
    User.findOne({ username: username }).exec((err, user) => {
      if (err) return cb(err);
      if (!user) {
        return cb(null, false, { message: "No user found with that username" });
      }
      bcrypt.compare(password, user.password, function (err, res) {
        if (res) {
          return cb(null, user);
        }
        return cb(null, false, { message: "Password is incorrect" });
      });
    });
  })
);

passport.serializeUser(function (user, cb) {
  console.log("User at serializeUser", user);
  cb(null, user.id);
});

passport.deserializeUser(function (id, cb) {
  User.findById(id, (err, user) => {
    cb(err, user);
  });
});

// Routing logic
router.get("/sign-up", userController.signUpGet);

router.post("/sign-up", userController.signUpPost);

router.get("/sign-in", userController.signInGet);

router.post("/sign-in", userController.signInPost);

router.post("/sign-out", userController.signOutPost);

module.exports = router;
