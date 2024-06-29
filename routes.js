'use strict';

/*********************************************************
 * LOAD MODULES
*********************************************************/
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

/** GET - Route returns all properties and values for current authenticated user*/
router.get('/users', authenticateUser, asyncHandler((req, res) => {
  // If authentication passes, save the currentUser from the request body to the variable "user"
  const user = req.currentUser;

  // If authentication passes, respond with user information in JSON format
  if (!user) {
    return res.status(404).json({ message: 'Authentication failure'});
  } else {
    res.status(200).json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.emailAddress,  
    })
  };

}));

/** POST - Route that creates a new user*/ 
router.post('/users', asyncHandler( async(req, res) => {
  try {
    // Create a new user using .create() function, passing in data in req.body and saving to variable
    const newUser = await User.create(req.body);
    console.log(newUser);
    // Respond with success message and 201 status, and change location to '/'
    res.status(201).location('/').json({ "message": "Account successfully created!" });
  } catch (error) {

    // If the error is a 'SequelizeValidationError' or 'SequelizeUniqueConstraintError', log error in console, and respond with 400 status and list Sequelize validation errors
    if (error.name === 'SequelizeValidationError') {
      console.error('SequelizeValidationError')
      const errors = error.errors.map(err => err.message);
      res.status(400).json({ errors });   
    } else if (error.name === 'SequelizeUniqueConstraintError') {
      console.error('SequelizeUniqueContraintError')
      const errors = error.errors.map(err => err.message);
      res.status(400).json({ errors });   
    } else {
      //If not a Sequelize validation error, throw error to Global Handler
      throw error;
    }
  }
}));


/*********************************************************
 * COURSE ROUTES
*********************************************************/

























/** GET - Route returns all courses including User object associated with each course and 200*/
router.get('/courses', asyncHandler(async (req, res) => {
  // Retrieve courses, including user model
  const courses = await Course.findAll({
    // Filters out 'createdAt' and 'updatedAt' properties from the response
    attributes: ["id", "title", "description", "estimatedTime", "materialsNeeded", "userId" ],
    include: [{
      model: User,
      // Filters out 'createdAt', 'updatedAt', and 'password' properties from the response
      attributes: ["id", "firstName", "lastName", "emailAddress"]
    }],

  });
  // Respond with list of all courses and 200 Status
  res.status(200).json({ courses });
}));







/** GET - Route returns corresponding course including asscociated User object and 200*/ 
router.get('/courses/:id', asyncHandler(async (req, res) => {
  // Find course using the request parameter "id", include user model
  const course = await Course.findByPk(req.params.id, {
    // Filters out 'createdAt' and 'updatedAt' properties from the response
    attributes: ["id", "title", "description", "estimatedTime", "materialsNeeded", "userId" ],
    include: [{
      model: User,
      // Filters out 'createdAt', 'updatedAt', and 'password' properties from the response
      attributes: ["id", "firstName", "lastName", "emailAddress"]
    }],
  });
  console.log(course);
  // Response with course information and 200 Status
  res.status(200).json({ course });
}));






















/** POST - Route creates a new course, returns 201*/  
router.post('/courses', authenticateUser, asyncHandler(async (req, res) => {
  try {
    // Create a new course using .create() method on the Course model, passing in data in req.body and saving to variable newCourse
    const newCourse = await Course.create(req.body);
    console.log(newCourse);
    // Respond with success message and 201 status, and change location to the new course URL
    res.status(201).location(`/courses/${newCourse.id}`).json({ "message": "Course successfully created!" });
  } catch (error) {
    // If the error is a 'SequelizeValidationError' or 'SequelizeUniqueConstraintError', log error in console, and respond with 400 status and list Sequelize validation errors
    if (error.name === 'SequelizeValidationError') {
      console.error('SequelizeValidationError');
      const errors = error.errors.map(err => err.message);
      res.status(400).json({ errors });   
    } else if (error.name === 'SequelizeUniqueConstraintError') {
      console.error('SequelizeUniqueContraintError')
      const errors = error.errors.map(err => err.message);
      res.status(400).json({ errors });   
    } else {
      //If not a Sequelize validation error, throw error to Global Handler
      throw error;
    }
  };
}));

/** PUT - Route updates the corresponding course and returns 204*/ 
router.put('/courses/:id', authenticateUser, asyncHandler(async (req, res) => {

  // Extract data from req.body and save to variable putRequest
  const putRequest = req.body

  // Find course in the db using request paramater "id", include user model
  const oldCourse = await Course.findByPk(req.params.id, {
    include: [{
      model: User,
    }],
  });

  // If a course is found in the db, update the course using .update() method on Course model
  if(oldCourse){
    const updatedCourse = await oldCourse.update({
      title: putRequest.title,
      description: putRequest.description,
      estimatedTime: putRequest.estimatedTime,
      materialsNeeded: putRequest.materialsNeeded,
      userId: putRequest.userId
    });

    // Log updated course to Terminal
    console.log(updatedCourse.get({ plain: true }));

    // Respond with 204 Status and no content
    res.status(204).json();

  } else {
    // If no course is found in db, respond with 404 Status and "Course Not Found" message
    res.status(404).json({message: "Course Not Found"});
  }
}));

/** DELETE - Route deletes corresponding course and returns 204*/ 
router.delete('/courses/:id', authenticateUser, asyncHandler(async (req, res) => {

  const courseToDelete = await Course.findByPk(req.params.id, {
    include: [{
      model: User,
    }],
  });

  if(courseToDelete){
    await courseToDelete.destroy();
    res.status(204).json();

  } else {
    res.status(404).json({message: "Course Not Found"});
  }

}));




module.exports = router;