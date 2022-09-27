const mongoose = require("mongoose");
const { format } = require("date-fns");

const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  title: { type: String, required: true, minLength: 3, maxLength: 200 },
  text: { type: String, required: true, minLength: 10, maxLength: 500 },
  timestamp: { type: Date, default: Date.now },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

MessageSchema.virtual("timestampFormat").get(function () {
  return format(this.timestamp, "Pp");
});

module.exports = mongoose.model("Message", MessageSchema);
