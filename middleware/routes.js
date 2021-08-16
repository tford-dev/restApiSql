"use strict";

const express = require("express");
const {asyncHandler} = require("./asyncHandler");
const { User } = require('../models');
const {authenticateUser} = require("./authUser");
const bcrypt = require("bcrypt");
const router = express.Router();

router.get('/users', authenticateUser, asyncHandler(async (req, res) => {
    const user = req.currentUser;
    res.json({
        firstName: user.firstName,
        lastName: user.lastName
    });
}));

router.post('/users', asyncHandler(async (req, res) => {
  try {
    const salt =  await bcrypt.genSalt()
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const user = {firstName: req.body.firstName, lastName: req.body.lastName, emailAddress: req.body.emailAddress, password: hashedPassword};

    await User.create(user);
    res.status(201).json({ "message": "Account successfully created." });
    res.redirect("/")
  } catch (error) {
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      const errors = error.errors.map(err => err.message);
      res.status(400).json({ errors });   
    } else {
      throw error;
    }
  }
}));

module.exports = router;


