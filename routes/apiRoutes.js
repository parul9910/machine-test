const express = require("express");
const router = express.Router();

const {
  createUser,
  changeUsersStatus,
  getDistance,
  getUserListing
} = require("../controller/api");
const { protectUser } = require("../middleware/authUser");

router.post("/create-user", createUser);
router.put("/change-status", protectUser, changeUsersStatus);
router.post("/get-distance", protectUser, getDistance);
router.get("/user-listing", protectUser, getUserListing);


module.exports = router;