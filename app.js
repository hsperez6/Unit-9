'use strict';
/*********************************************************
 * LOAD MODULES
*********************************************************/
const express = require('express');
const morgan = require('morgan');
const { sequelize, User, Course } = require('./models');
const routes = require('./routes');


/*********************************************************
 * HELPER FUNCTIONS
*********************************************************/
// variable to enable global error logging
const enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true';

// create the Express app
const app = express();

// Setup request body JSON parsing.
app.use(express.json());

// setup morgan which gives us http request logging
app.use(morgan('dev'));


/*********************************************************
 * DATABASE CONNECTION
*********************************************************/
(async () => {
  // Test the database connection.
  try {
    await sequelize.authenticate();
    console.log('Connection to database is successful.');
    await sequelize.sync();
    console.log('Sequelize models sync successful');
  } catch (error) {
    console.error('Unable to connect and sync to the database:', error);
  };

  // Retrieve courses
  // console.log('Retrieving courses from database');
  // const courses = await Course.findAll({
  //   include: [{
  //     model: User,
  //   }],
  // });
  // console.log(courses.map(course => course.get({ plain: true })));

  // Retrieve users
  // console.log('Retrieving users from database');
  // const user = await User.findAll({
  //   include: [{
  //     model: Course,
  //   }],
  // });
  // console.log(JSON.stringify(user, null, 2));

})();



/*********************************************************
 * ROUTES
*********************************************************/
// setup a friendly greeting for the root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the REST API project!',
  });
});

// Add routes.
app.use('/api', routes);



/*********************************************************
 * ERROR HANDLERS
*********************************************************/
// send 404 if no other route matched
app.use((req, res) => {
  res.status(404).json({
    message: 'Route Not Found',
  });
});

// setup a global error handler
app.use((err, req, res, next) => {
  if (enableGlobalErrorLogging) {
    console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
  }

  res.status(err.status || 500).json({
    message: err.message,
    error: {},
  });
});



/*********************************************************
 * SET PORT AND SERVER
*********************************************************/
// set our port
app.set('port', process.env.PORT || 5000);

// start listening on our port
const server = app.listen(app.get('port'), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
});