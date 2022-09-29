const { body, validationResult } = require("express-validator");

const User = require("../models/user");

exports.index = (req, res, next) => {};

exports.usersIndex = (req, res, next) => {
  User.find({}).exec((err, users) => {
    if (err) return next(err);
    return res.render("usersIndex", { title: "Users", users });
  });
};

exports.joinClubGet = (req, res, next) => {
  res.render("joinClub", { title: "Join the Club" });
};

exports.joinClubPost = [
  body("secretCode", "Invalid secret code")
    .trim()
    .custom((secretCode) => {
      if (secretCode != "membersonlyclub") {
        throw new Error("This secret code is invalid");
      }
      return true;
    })
    .escape(),
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render("joinClub", {
        title: "Join the Club",
        secretCode: req.body.secretCode,
        errors: errors.array(),
      });
    }

    if (!req.user) {
      return res.render("joinClub", {
        title: "Join the Club",
        errors: [
          { msg: "You first need to sign up to gain the membership status" },
        ],
      });
    }

    User.findByIdAndUpdate(
      req.user._id,
      { membership: true },
      {},
      function (err) {
        if (err) return next(err);
        res.redirect("/");
      }
    );
  },
];
