'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Course extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Course.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'A valid input is required for Title',
        },
        notEmpty: {
          msg: 'A title is required',
        },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'A valid description is required',
        },
        notEmpty: {
          msg: 'A description is required',
        },
      },
    },
    estimatedTime: {
      type: DataTypes.STRING,
    },
    materialsNeeded: {
      type: DataTypes.STRING,
    }
  }, {
    sequelize,
    modelName: 'Course',
  });

  // Model associations
  Course.associate = (models) => {
    Course.belongsTo(models.User, {
      foreignKey: {
        fieldName: 'userId',
        allowNull: false,
      },
    });
  };

  return Course;
};