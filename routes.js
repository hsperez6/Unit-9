'use strict';

const express = require('express');
const { asyncHandler } = require('./middleware/async-handler');
const { authenticateUser } = require('./middleware/auth-user');
const { User, Course } = require('./models');
const bcrypt = require('bcryptjs');

// Construct a router instance.
const router = express.Router();

/*********************************************************
 * USER ROUTES
*********************************************************/
// Route returns all properties and values for current authenticated user
router.get('/users', authenticateUser, asyncHandler((req, res) => {
  // If authentication passes, save the currentUser from the request body to the variable "user"
  const user = req.currentUser;

  // If authentication passes, respond with user information in JSON format
  if (user) {
    res.status(200).json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.emailAddress,  
    });
  } //else {
  //   // If authentication, 
  //   return res.status(404).json({ message: 'User cannot be found'});
  // }
  

  // if (!user) {
  //   return res.status(404).json({ message: 'User cannot be found'});
  // };  
  // res.status(200).json({
  //   id: user.id,
  //   firstName: user.firstName,
  //   lastName: user.lastName,
  //   email: user.emailAddress,  
  // });

}));

// Route that creates a new user.
router.post('/users', asyncHandler( async(req, res) => {
  try {
    const newUser = await User.create(req.body);
    console.log(newUser);
    res.status(201).location('/').json({ "message": "Account successfully created!" });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      console.error('SequelizeValidationError')
      const errors = error.errors.map(err => err.message);
      res.status(400).json({ errors });   
    } else if (error.name === 'SequelizeUniqueConstraintError') {
      console.error('SequelizeUniqueContraintError')
      const errors = error.errors.map(err => err.message);
      res.status(400).json({ errors });   
    } else {
      throw error;
    }
  }
}));



/*********************************************************
 * COURSE ROUTES
*********************************************************/
// Route returns all courses including User object associated with each course and 200
router.get('/courses', asyncHandler(async (req, res) => {
  // Retrieve courses
  const courses = await Course.findAll({
    include: [{
      model: User,
    }],
  });
  res.status(200).json({ courses });
}));

// Route returns corresponding course including asscociated User object and 200
router.get('/courses/:id', asyncHandler(async (req, res) => {
  const course = await Course.findByPk(req.params.id, {
    include: [{
      model: User,
    }],
  });
  console.log(course);
  res.status(200).json({ course });
}));

// Route creates a new course, returns 201 
router.post('/courses', authenticateUser, asyncHandler(async (req, res) => {
  try {
    const newCourse = await Course.create(req.body);
    console.log(newCourse);
    res.status(201).location(`/courses/${newCourse}.id`).json({ "message": "Course successfully created!" });
  } catch (error) {
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      const errors = error.errors.map(err => err.message);
      res.status(400).json({ errors });   
    } else {
      throw error;
    }
  }
}));

// Route updates the corresponding course and returns 204
router.put('/courses/:id', authenticateUser, asyncHandler(async (req, res) => {

  const putRequest = req.body
  // console.log(putRequest);

  const oldCourse = await Course.findByPk(req.params.id, {
    include: [{
      model: User,
    }],
  });
  // console.log(oldCourse);

  if(oldCourse){
    const updatedCourse = await oldCourse.update({
      title: putRequest.title,
      description: putRequest.description,
      estimatedTime: putRequest.estimatedTime,
      materialsNeeded: putRequest.materialsNeeded,
      userId: putRequest.userId
    });
    console.log(updatedCourse.get({ plain: true }))
    res.status(204).json();
    // res.status(202).json({ updatedCourse });
  } else {
      res.status(404).json({message: "Course Not Found"});
  }
}));

// Route deletes corresponding course and returns 204
router.delete('/courses/:id', authenticateUser, asyncHandler(async (req, res) => {

  const courseToDelete = await Course.findByPk(req.params.id, {
    include: [{
      model: User,
    }],
  });

  if(courseToDelete){
    await courseToDelete.destroy();
    res.status(204).json();
    // res.status(202).json({ updatedCourse });
  } else {
      res.status(404).json({message: "Course Not Found"});
  }



}));




module.exports = router;