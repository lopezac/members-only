const { body, validationResult } = require("express-validator");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const async = require("async");

const User = require("../models/user");
const Message = require("../models/message");

// Authentication
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
        // confirmPassword: req.body.confirmPassword,
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

// CRUD methods
exports.userDetailGet = (req, res, next) => {
  async.parallel(
    {
      user(callback) {
        User.findById(req.params.id).exec(callback);
      },
      messages(callback) {
        Message.find({ user: req.params.id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) return next(err);
      res.render("userDetail", {
        title: results.user.username,
        user: results.user,
        messages: results.messages,
      });
    }
  );
};

exports.userUpdateGet = (req, res, next) => {
  User.findById(req.params.id).exec((err, user) => {
    if (err) return next(err);
    res.render("signUp", { title: "Update user", user });
  });
};

exports.userUpdatePost = [
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
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      console.log(req.body.membership);
      return res.render("signUp", {
        title: "Update user",
        user,
        // confirmPassword: req.body.confirmPassword,
        errors: errors.array(),
      });
    }

    bcrypt.genSalt(10, function (err, salt) {
      if (err) return next(err);
      bcrypt.hash(user.password, salt, function (err, hashedPassword) {
        if (err) return next(err);
        user.password = hashedPassword;
        User.findByIdAndUpdate(req.params.id, user, {}, (err) => {
          if (err) return next(err);
          res.redirect(user.url);
        });
      });
    });
  },
];

exports.userDeleteGet = (req, res, next) => {
  async.parallel(
    {
      user(callback) {
        User.findById(req.params.id).exec(callback);
      },
      messages(callback) {
        Message.find({ user: req.params.id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) return next(err);
      res.render("userDelete", {
        title: "Delete user",
        messages: results.messages,
        user: results.user,
      });
    }
  );
};

exports.userDeletePost = (req, res, next) => {
  async.parallel(
    {
      user(callback) {
        User.findById(req.params.id).exec(callback);
      },
      messages(callback) {
        Message.find({ user: req.params.id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) return next(err);

      if (req.user && req.user._id.toString() === results.user._id.toString()) {
      }

      if (results.messages.length) {
        res.render("userDelete", {
          title: "Delete user",
          messages: results.messages,
          user: results.user,
          errors: [{ msg: "You need to delete all your posts." }],
        });
      }

      res.render("userDelete", {
        title: "Delete user",
        messages: results.messages,
        user: results.user,
      });
    }
  );
};
