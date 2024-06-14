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
router.get('/users', (req, res) => {
  res.json({
    message: 'Welcome to api/users GET Route',
  });
});

// Route that creates a new user.
router.post('/users', asyncHandler(async (req, res) => {
  try {
    const newUser = await User.create(req.body);
    res.status(201).location('/').json({ "message": "Account successfully created!" });
  } catch (error) {
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      const errors = error.errors.map(err => err.message);
      res.status(400).json({ errors });   
    } else {
      throw error;
    }
  }

  /**
    if(req.body.author && req.body.quote){
      const quote = await records.createQuote({
        quote: req.body.quote,
        author: req.body.author
      });
      res.status(201).json(quote);
    } else {
      res.status(400).json({message: "Quote and author required."});
    }
  */

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
router.post('/courses', asyncHandler(async (req, res) => {

  // if(req.body.author && req.body.quote){
  //   const quote = await records.createQuote({
  //       quote: req.body.quote,
  //       author: req.body.author
  //   });
  //   res.status(201).json(quote);
  // } else {
  //   res.status(400).json({message: "Quote and author required."});
  // }

  try {
    await Course.create(req.body);
    res.status(201).json({ "message": "Course successfully created!" });
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
router.put('/courses/:id', asyncHandler(async (req, res) => {
  
  const oldCourse = await Course.findByPk(req.params.id);
  

  if(oldCourse){
      oldCourse.title = req.body.title;
      oldCourse.description = req.body.description;
      oldCourse.estimatedTime = req.body.estimatedTime;
      oldCourse.materialsNeeded = req.body.materialsNeeded; 

      // await course.updateQuote(quote);
      res.status(204).end();
  } else {
      res.status(404).json({message: "Quote Not Found"});
  }






}));

// Route deletes corresponding course and returns 204
router.delete('/courses/:id', asyncHandler(async (req, res) => {

}));




module.exports = router;