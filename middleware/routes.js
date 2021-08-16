"use strict";

const express = require("express");
const {asyncHandler} = require("./asyncHandler");
const { User, Course } = require('../models');
const {authenticateUser} = require("./authUser");
const bcrypt = require("bcrypt");
const router = express.Router();
let activeUser;

router.get('/users', authenticateUser, asyncHandler(async (req, res) => {
    const user = req.currentUser;
    activeUser = user;
    res.status(200);
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
    res.location('/');
    res.status(201).end();
    //removed code below because project required no content on this post request.
    //.json({ "message": "Account successfully created." });
  } catch (error) {
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      const errors = error.errors.map(err => err.message);
      res.status(400).json({ errors });   
    } else {
      throw error;
    }
  }
}));

router.get("/courses", asyncHandler(async(req, res) => {
  try {
    const courses = await Course.findAll({
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: "student",
        }
      ]
    });
    courses.map(course =>{
      res.json({ 
        title: course.title,
        description: course.description,
        estimatedTime: course.estimatedTime,
        materialsNeeded: course.materialsNeeded,
        student: course.student.firstName + " " + course.student.lastName
      });
    });
    res.status(200).end();
  } catch(error){
    throw error;
  }
}));

router.get("/courses/:id", asyncHandler(async(req, res) => {
  try {
    const course = await Course
      .findByPk(req.params.id, 
        {include: [
          {
            model: User,
            as: "student",
          }
        ]}
    );

    if(course){
      res.json({ course })
    }
  } catch(error){
    throw error;
  }
}))

router.post("/courses", asyncHandler(async(req, res) => {
  try{
    await Course.create(req.body);
    res.location(`/course/${Course.id}`);
    res.status(201).json({
      "message": "New course successfully created."
    });
  } catch(error){
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      const errors = error.errors.map(err => err.message);
      res.status(400).json({ errors });   
    } else {
      throw error;
    }
  }
}));

router.put("/courses/:id", asyncHandler(async(req, res) => {
  try{
    const course = await Course.findByPk(req.params.id);
    console.log("Retrieved course from put request");
    if(course){
      await course.update(req.body);
      res.status(204).end();
    } else {
      res.status(404).json({message: "Course Not Found"});
    }
  } catch(error){
    throw error;
  }
}));

router.delete("/courses/:id", async(req, res)=>{
  try{
    const course = await Course.findByPk(req.params.id);
    await course.destroy();
    console.log("Course Successfully Deleted");
    res.status(204).end();
  } catch(error){
    throw(error)
  } 
})

module.exports = router;


