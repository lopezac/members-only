const { body, validationResult } = require("express-validator");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const async = require("async");

const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const User = require("../models/user");
const Message = require("../models/message");

// Authentication
exports.signUpGet = (req, res, next) => {
  res.render("signUp", { title: "Sign Up" });
};

exports.signUpPost = [
  upload.single("userImage"),
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
  body("isAdmin", "Must select if you are an admin").toBoolean(),
  (req, res, next) => {
    const errors = validationResult(req);

    const user = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      username: req.body.username,
      password: req.body.password,
      membership: req.body.membership,
      isAdmin: req.body.isAdmin,
      image: {
        name: req.file && req.file.originalname,
        fileType: req.file && req.file.mimetype,
        data: req.file && req.file.buffer,
      },
    });

    if (!errors.isEmpty()) {
      console.log(req.body.membership);
      return res.render("signUp", {
        title: "Sign Up",
        user,
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
          req.login(user, function (err) {
            if (err) return next(err);
            return res.redirect("/");
          });
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
    return res.redirect("/");
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
        Message.find({ user: req.params.id }).populate("user").exec(callback);
      },
    },
    (err, results) => {
      if (err) return next(err);
      console.log("user", results.user);
      if (!results.user) return res.redirect("/"); //remove it boy
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
    return res.render("signUp", { title: "Update user", user });
  });
};

exports.userUpdatePost = [
  upload.single("userImage"),
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
  body("isAdmin", "Must select if you are an admin").toBoolean(),
  (req, res, next) => {
    const errors = validationResult(req);

    const user = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      username: req.body.username,
      password: req.body.password,
      membership: req.body.membership,
      isAdmin: req.body.isAdmin ? true : false,
      image: {
        name: req.file && req.file.originalname,
        fileType: req.file && req.file.mimetype,
        data: req.file && req.file.buffer,
      },
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      console.log(req.body.membership);
      return res.render("signUp", {
        title: "Update user",
        user,
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
  res.clearCookie("connect.sid");
  User.findByIdAndDelete(req.params.id, function (err) {
    if (err) return next(err);
    return res.redirect("/"); // /user/req.params.id
  });
};
