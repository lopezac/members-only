var express = require("express");
var router = express.Router();

const userController = require("../controllers/userController");
const baseController = require("../controllers/baseController");
const messageController = require("../controllers/messageController");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.get("/join-club", baseController.joinClubGet);

router.post("/join-club", baseController.joinClubPost);

router.get("/users", baseController.usersIndex);

// Message
router.get("/message/create", messageController.messageCreateGet);

router.post("/message/create", messageController.messageCreatePost);

router.get("/message/:id/update", messageController.messageUpdateGet);

router.post("/message/:id/update", messageController.messageUpdatePost);

router.post("/message/:id/delete", messageController.messageDeletePost);

router.get("/message/:id", messageController.messageDetailGet);

// User
router.get("/user/:id", userController.userDetailGet);

router.get("/user/:id/update", userController.userUpdateGet);

router.post("/user/:id/update", userController.userUpdatePost);

router.get("/user/:id/delete", userController.userDeleteGet);

router.post("/user/:id/delete", userController.userDeletePost);

module.exports = router;
