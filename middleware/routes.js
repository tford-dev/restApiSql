"use strict";

const express = require("express");
const {asyncHandler} = require("./asyncHandler");
const { User, Course } = require('../models');
const {authenticateUser} = require("./authUser");
const bcrypt = require("bcrypt");
const router = express.Router();

//GET route for user authentication
router.get('/users', authenticateUser, asyncHandler(async (req, res) => {
    const user = req.currentUser;
    res.status(200);

    //json data to display current user's firstname and lastname
    res.json({
        firstName: user.firstName,
        lastName: user.lastName
    });
}));

//POST route to create a new user
router.post('/users', asyncHandler(async (req, res) => {
  try {
    const salt =  await bcrypt.genSalt()
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    
    //swapped password for hashedPassword so user-password isn't saved as plain text in database
    const user = {firstName: req.body.firstName, lastName: req.body.lastName, emailAddress: req.body.emailAddress, password: hashedPassword};

    await User.create(user);

    //sets location header to "/"
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

//GET route to display course data from database
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

    //Loops through course data to filter out 'createdAt' and 'updatedAt' when displaying courses
    courses.map(course =>{
      res.json({ 
        id: course.id,
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

//GET route to display a specific course
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
      res.json({ 
        id: course.id,
        title: course.title,
        description: course.description,
        estimatedTime: course.estimatedTime,
        materialsNeeded: course.materialsNeeded,
        userId: course.userId,
        student: course.student.firstName + " " + course.student.lastName
      });
    }
  } catch(error){
    throw error;
  }
}))

//POST route to create a course
router.post("/courses", authenticateUser, asyncHandler(async(req, res) => {
  try{
    await Course.create(req.body);

    //Sets location header to specific course id
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

//PUT route to edit a course
router.put("/courses/:id", authenticateUser, asyncHandler(async(req, res) => {
  const user = req.currentUser;
  try{
    const course = await Course.findByPk(req.params.id);
    console.log("Retrieved course from put request");
    //Checks to see if current user possesses the course
    if(user.id === course.userId){
      if(course){
        await course.update(req.body);
        res.status(204).end();
      } else {
        res.status(404).json({message: "Course Not Found"});
      }
    } else {
      res.status(403).json({message: "Access Denied"}).end();
    }
  } catch(error){
    throw error;
  }
}));

//Delete route to destroy a specific course
router.delete("/courses/:id", authenticateUser, async(req, res)=>{
  const user = req.currentUser;
  try{
    const course = await Course.findByPk(req.params.id);
    //Checks to see if current user possesses the course
    if(user.id === course.userId){
      await course.destroy();
      console.log("Course Successfully Deleted");
      res.status(204).end();
    } else {
      res.status(403).json({message: "Access Denied"}).end();
    }
  } catch(error){
    throw(error)
  } 
})

module.exports = router;


