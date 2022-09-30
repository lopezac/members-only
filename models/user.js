const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  firstName: { type: String, required: true, minLength: 3, maxLength: 60 },
  lastName: { type: String, required: true, minLength: 3, maxLength: 60 },
  username: { type: String, required: true, minLength: 5, maxLength: 100 },
  password: { type: String, required: true, minLength: 7 },
  membership: { type: Boolean, required: true, default: false },
  isAdmin: { type: Boolean, required: true, default: false },
});

UserSchema.virtual("fullName").get(function () {
  return this.firstName + " " + this.lastName;
});

UserSchema.virtual("url").get(function () {
  return `/user/${this._id}`;
});

module.exports = mongoose.model("User", UserSchema);
