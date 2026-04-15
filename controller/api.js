const express = require('express')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')

const userModel = require('../models/user')

const createUser = async (req, res) => {
  try {
    const { name, email, password, address, latitude, longitude } = req.body;

    if (!name || !email || !password || !address || !latitude || !longitude) {
      return res.status(400).send({ message: "All fields are required" });
    }

    const isExist = await userModel.findOne({ email });
    if (isExist) {
      return res.status(400).send({ message: "User already exists" });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      name,
      email,
      password: hashPassword,
      address,
      latitude,
      longitude,
      status: "active"
    });

    const token = jwt.sign(
      {
        _id: user._id,
        latitude: user.latitude,
        longitude: user.longitude
      },
      process.env.JWT_SECRET,
      { expiresIn: "10h" }
    );

    res.status(200).send({
      status_code: "200",
      message: "User created successfully",
      data: {
        name: user.name,
        email: user.email,
        address: user.address,
        latitude: user.latitude,
        longitude: user.longitude,
        status: user.status,
        register_at: user.createdAt,
        token
      }
    });

  } catch (error) {
    console.log("Error in createUser:", error.message);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

const changeUsersStatus = async (req, res) => {
  try {
    const users = await userModel.find();

    for (let i = 0; i < users.length; i++) {
      if (users[i].status === "active") {
        users[i].status = "inactive";
      } else {
        users[i].status = "active";
      }

      await users[i].save();
    }

    res.status(200).send({
      status_code: "200",
      message: "Users status updated successfully"
    });

  } catch (error) {
    console.log(error.message);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

const getDistance = async (req, res) => {
  try {
    const { destination_latitude, destination_longitude } = req.body;

    if (!destination_latitude || !destination_longitude) {
      return res.status(400).send({ message: "Destination required" });
    }

    const userLat = req.payload.latitude;
    const userLng = req.payload.longitude;

    const toRad = (val) => val * (Math.PI / 180);

    const R = 6371; 

    const dLat = toRad(destination_latitude - userLat);
    const dLng = toRad(destination_longitude - userLng);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(userLat)) *
      Math.cos(toRad(destination_latitude)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    res.status(200).send({
      status_code: "200",
      message: "Distance calculated",
      distance: distance.toFixed(2) + " km"
    });

  } catch (error) {
    console.log("Error in getDistance:", error.message);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

const getUserListing = async (req, res) => {
  try {
    const { week_number } = req.query;

    if (!week_number) {
      return res.status(400).send({ message: "week_number required" });
    }

    const days = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];

    const selectedDays = week_number.split(',').map(Number);

    const users = await userModel.find({}, { name: 1, email: 1, createdAt: 1 });

    const result = {};

    selectedDays.forEach(day => {
      result[days[day]] = [];
    });

    users.forEach(user => {
      const dayIndex = new Date(user.createdAt).getDay(); 

      if (selectedDays.includes(dayIndex)) {
        const dayName = days[dayIndex];

        result[dayName].push({
          name: user.name,
          email: user.email
        });
      }
    });

    res.status(200).send({
      status_code: "200",
      message: "User listing fetched",
      data: result
    });

  } catch (error) {
    console.log("Error in getUserListing:", error.message);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

module.exports = {
  createUser,
  changeUsersStatus,
  getDistance,
  getUserListing
};