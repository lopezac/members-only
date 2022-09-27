const LocalStrategy = require("passport-local").Strategy;
const passport = require("passport");
const express = require("express");
const router = express.Router();

const User = require("../models/user");
const userController = require("../controllers/userController");

// Passport logic
passport.use(
  new LocalStrategy((username, password, cb) => {
    User.find({ username: username }).exec((err, user) => {
      if (err) return cb(err);
      if (!user) {
        return cb(null, false, { message: "No user found with that username" });
      }
      if (user.password !== password) {
        return cb(null, false, { message: "Incorrect password" });
      }
      return cb(null, user);
    });
  })
);

passport.serializeUser(function (user, cb) {
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
