const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true
    },

    address: {
      type: String,
      required: true
    },

    latitude: {
      type: Number,
      required: true
    },

    longitude: {
      type: Number,
      required: true
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active"
    }

  },
  {
    timestamps: true  
  }
);

module.exports = mongoose.model("user", userSchema);