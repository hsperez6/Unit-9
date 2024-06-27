'use strict';

const auth = require('basic-auth');
const bcrypt = require('bcryptjs');
const { User } = require('../models');

/**
 * Middleware to authenticate the request using Basic Authentication.
 * @param {Request} req - The Express Request object.
 * @param {Response} res - The Express Response object.
 * @param {Function} next - The function to call to pass execution to the next middleware.
*/
exports.authenticateUser = async (req, res, next) => {
  // store the message to display
  let message;

  // Parse the user's credentials from Authorization header
  const credentials = auth(req);

  console.log(credentials);

  if (credentials) {
    // Find user in database using the email provided in credentials.name
    const user = await User.findOne({ where: {emailAddress: credentials.name} });

    // If a user is found, compare password from credentials.pass with user.password from db
    if (user) {
      const authenticated = bcrypt.compareSync(credentials.pass, user.password);

      // If passwords match, log message the terminal and add user to request body
      if (authenticated) {
        console.log(`Authentication successful for username: ${user.emailAddress}`);
        req.currentUser = user;

      } else {
        // If passwords do not match, add failure string to variable message
        message = `Authentication failure for email: ${user.emailAddress}`;
      }

    } else {
      // If a user is not found in the db, add the following string to variable message
      message = `User not found for username: ${credentials.name}`;
    }

  } else {
    // If no authorization header is found in the request, add the following string to variable message
    message = 'Auth header not found';
  }

  //If an error string has been added to the variable message, log the message to the terminal, respond with 401 and 'Access Denied' message to client
  if (message) {
    console.error(message);
    res.status(401).json({ message: 'Access Denied' });
  } else {
    next();
  }
};