'use strict';

const express = require('express');
const { asyncHandler } = require('./middleware/async-handler');
const { User, Course } = require('./models');

// const { authenticateUser } = require('./middleware/auth-user');

// Construct a router instance.
const router = express.Router();

// Route returns all properties and values for current authenticated user
router.get('/users', (req, res) => {

  res.json({
    message: 'Welcome to the Router Module',
  });

});

// Route that creates a new user.
router.post('/users', asyncHandler(async (req, res) => {

  try {
    await User.create(req.body);
    res.status(201).json({ "message": "Account successfully created!" });
  } catch (error) {
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      const errors = error.errors.map(err => err.message);
      res.status(400).json({ errors });   
    } else {
      throw error;
    }
  }

}));





// Route returns all courses including User object associated with each course and 200
router.get('/courses', asyncHandler(async (req, res) => {

  // Retrieve courses
  const courses = await Course.findAll({
    include: [{
      model: User,
    }],
  });
  // console.log(courses.map(course => course.get({ plain: true })));

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

}));


// Route updates the corresponding course and returns 204
router.put('/courses/:id', asyncHandler(async (req, res) => {

}));

// Route deletes corresponding course and returns 204
router.delete('/courses/:id', asyncHandler(async (req, res) => {

}));




module.exports = router;