'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }

  User.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'A first name is required',
        },
        notEmpty: {
          msg: 'Please provide your first name',
        },
      },
    },
    lastName: { 
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'A last name is required'
        }, 
        notEmpty: {
          msg: 'Please provide your last name'
        }
      }
    },
    emailAddress:  {
      type: DataTypes.STRING,
      // Checks if email account used for creating a new user is not already in the db
      unique: {
        msg: "An account for this email already exists."
      },
      allowNull: false,
      validate: {
        notNull: {
          msg: 'A valid input is required for email address',
        },
        isEmail: {
          msg: 'Must be a valid email address',
        },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      set(val) {
        // If password is not null or empty, hash the password and set the value
        if (val.length > 0 && val !== null) {          
          const hashedPassword = bcrypt.hashSync(val, 10);
          this.setDataValue('password', hashedPassword);
        }

      }, 
      validate: {
        notNull: {
          msg: 'A valid password is required',
        },
        notEmpty: {
          msg: 'Please provide a password',
        },
      },

    },
  }, {
    sequelize,
    modelName: 'User',
  });

  // Model Associations
  User.associate = (models) => {
    User.hasMany(models.Course, {
      foreignKey: {
        fieldName: 'userId',
        allowNull: false,
      },
      // as: 'courses',
    });
  };

  return User;
};
