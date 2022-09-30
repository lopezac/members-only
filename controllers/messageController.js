const { body, validationResult } = require("express-validator");

const Message = require("../models/message");

exports.messageCreateGet = (req, res, next) => {
  res.render("msgFormCreate", { title: "Write message" });
};

exports.messageCreatePost = [
  body("title", "Title must not be empty")
    .trim()
    .isLength({ min: 3, max: 200 })
    .escape(),
  body("text", "Text must not be empty")
    .trim()
    .isLength({ min: 10, max: 500 })
    .escape(),
  (req, res, next) => {
    const errors = validationResult(req);

    if (!req.user) {
      return res.render("msgFormCreate", {
        title: "Write message",
        errors: [{ msg: "You must be signed in to create a message" }],
      });
    }

    const message = new Message({
      title: req.body.title,
      text: req.body.text,
      user: req.user._id,
    });

    if (!errors.isEmpty()) {
      res.render("messageForm", {
        title: "Write message",
        errors: errors.array(),
        msg: message,
      });
    }

    message.save((err) => {
      if (err) return next(err);
      res.redirect(message.url);
    });
  },
];

exports.messageDetailGet = (req, res, next) => {
  Message.findById(req.params.id)
    .populate("user")
    .exec((err, message) => {
      if (err) return next(err);
      if (message) {
        return res.render("messageDetail", {
          title: message.title,
          msg: message,
        });
      }
      return next(err);
    });
};

exports.messageUpdateGet = (req, res, next) => {
  Message.findById(req.params.id)
    .populate("user")
    .exec((err, message) => {
      if (err) return next(err);
      if (message) {
        return res.render("msgFormUpdate", {
          title: "Update message",
          msg: message,
        });
      }
      return next(err);
    });
};

exports.messageUpdatePost = [
  body("title", "Title must not be empty")
    .trim()
    .isLength({ min: 3, max: 200 })
    .escape(),
  body("text", "Text must not be empty")
    .trim()
    .isLength({ min: 10, max: 500 })
    .escape(),
  (req, res, next) => {
    const errors = validationResult(req);

    if (!req.user) {
      return res.render("messageForm", {
        title: "Update message",
        errors: [
          {
            msg: "You must be signed in, and be the message's author to update it",
          },
        ],
      });
    }

    const message = new Message({
      title: req.body.title,
      text: req.body.text,
      user: req.user._id,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      res.render("msgFormUpdate", {
        title: "Write message",
        errors: errors.array(),
        msg: message,
      });
    }

    Message.findByIdAndUpdate(req.params.id, message, {}, (err) => {
      if (err) return next(err);
      res.redirect(message.url);
    });
  },
];

exports.messageDeletePost = (req, res, next) => {
  Message.findById(req.params.id)
    .populate("user")
    .exec((err, message) => {
      if (err) return next(err);
      if (!req.user) {
        res.render(message.url, {
          title: message.title,
        });
      }
      if (req.user && message.user._id.toString() === req.user._id.toString()) {
        Message.findByIdAndDelete(req.params.id, {}, (err) => {
          if (err) return next(err);
          res.redirect("/");
        });
      }
    });
};
