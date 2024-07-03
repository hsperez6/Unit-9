'use strict';

/*********************************************************
 * LOAD MODULES
*********************************************************/
const express = require('express');
const { asyncHandler } = require('./middleware/async-handler');
const { authenticateUser } = require('./middleware/auth-user');
const { User, Course } = require('./models');

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
    });

  };

}));


/** POST - Route that creates a new user*/ 
router.post('/users', asyncHandler( async(req, res) => {

  try {

    // Create a new user using .create() function, passing in data in req.body and saving to variable for logging
    const newUser = await User.create(req.body);
    console.log(newUser);

    // Respond with 201 status, set location to '/', and return no content
    res.status(201).location('/').json();

  } catch (error) {

    // If the error is a 'SequelizeValidationError' or 'SequelizeUniqueConstraintError', log error in console, and respond with 400 status and list Sequelize validation errors
    if (error.name === 'SequelizeValidationError') {

      console.error('SequelizeValidationError');
      const errors = error.errors.map(err => err.message);
      res.status(400).json({ errors });   

    } else if (error.name === 'SequelizeUniqueConstraintError') {

      console.error('SequelizeUniqueContraintError');
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

  // Respond with course information and 200 Status
  res.status(200).json({ course });

}));


/** POST - Route creates a new course, returns 201*/  
router.post('/courses', authenticateUser, asyncHandler(async (req, res) => {
  
  // Get user information from authernticatedUser middleware function and save to variable user
  const user = req.currentUser;

  // Get information from the request body and save to variable requestBody
  const requestBody = req.body;

  try {
  
    // Create a new course using .create() method on the Course model, passing in "title" and "description" data from requestBody variable and "userId" from user variable, and saving to variable newCourse
    const newCourse = await Course.create({
      "title": requestBody.title,
      "description": requestBody.description,
      "userId": user.id
    });
    console.log(newCourse);
  
    // Respond with 201 status, set location to the new course URI, and return no content
    res.status(201).location(`/courses/${newCourse.id}`).json();
  
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
  
    };

  };

}));


/** PUT - Route updates the corresponding course and returns 204*/ 
router.put('/courses/:id', authenticateUser, asyncHandler(async (req, res) => {

  // Extract data from req.body and save to variable putRequest
  const putRequest = req.body;
 
  // Find course in the db using request paramater "id", include user model
  const oldCourse = await Course.findByPk(req.params.id, {
    include: [{
      model: User,
    }],
  });

  // Log the id of authenticated user (req.currentUser.id) and the id of the owner of the course from the db (oldCourse.userId)
  console.log(`This is the authenticated user id: ${req.currentUser.id}`);
  console.log(`This is the id of the owner of the course from the database: ${oldCourse.userId}`);

  // If a course is found in the db, update the course using .update() method on Course model
  if(oldCourse){

    // If the authenticated user (req.currentUser) is the owner of the course (oldCourse.userId), update the course
    if(req.currentUser.id === oldCourse.userId) {

      try {
        const updatedCourse = await oldCourse.update({
          title: putRequest.title,
          description: putRequest.description,
          estimatedTime: putRequest.estimatedTime,
          materialsNeeded: putRequest.materialsNeeded,
          // Ownership to remain the req.currentUser.id
          userId: req.currentUser.id
        });
  
        // Log updated course to Terminal
        console.log("The course was successfully updated");
        console.log(updatedCourse.get({ plain: true }));
  
        // Respond with 204 Status and no content
        res.status(204).json();

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
      
        };

      };

    } else {
      
      console.log("Error in trying to edit course with no ownership")
      res.status(403).json({message: "You are not the owner of the course. You can only change courses you own."});

    };

  } else {

    // If no course is found in db, respond with 404 Status and "Course Not Found" message
    res.status(404).json({message: "Course Not Found"});

  };

}));


/** DELETE - Route deletes corresponding course and returns 204*/ 
router.delete('/courses/:id', authenticateUser, asyncHandler(async (req, res) => {

  // Find course in the db using req.params.id from URL, including user model, and save to variable 
  const courseToDelete = await Course.findByPk(req.params.id, {
    include: [{
      model: User,
    }],
  });

  // Log the id of authenticated user (req.currentUser.id) and the id of the owner of the course from the db (courseToDelete.userId)
  console.log(`This is the authenticated user id: ${req.currentUser.id}`);
  console.log(`This is the id of the owner of the course from the database: ${courseToDelete.userId}`);

  if(courseToDelete){

    // If the authenticated user (req.currentUser.id) is the owner of the course (oldCourse.userId), delete the course
    if(req.currentUser.id === courseToDelete.userId) {

      await courseToDelete.destroy();

      // Log updated course to Terminal
      console.log("The course was successfully deleted");

      // Respond with 204 Status and no content
      res.status(204).json();

    } else {
      // If requestor is not the owner of the course, log error message to terminal and send error message response
      console.error("Error attempting to delete a course without ownership")
      res.status(403).json({message: "You are not the owner of the course. You can only delete courses you own."});

    }

  } else {
    res.status(404).json({message: "Course Not Found"});
  }

}));


module.exports = router;