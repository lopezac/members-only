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

router.get("/message/create", messageController.createMessageGet);

router.post("/message/create", messageController.createMessagePost);

module.exports = router;
