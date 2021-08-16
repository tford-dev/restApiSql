"use strict";
const { Model, DataTypes } = require("sequelize");
const bcrypt = require("bcrypt");

module.exports = (sequelize) => {
    class User extends Model {}
    User.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        firstName: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        lastName: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        emailAddress: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: {
                msg: "The email address you entered already exists."
            },
            validate: {
                notNull: {
                msg: 'An email address is required.'
                },
                isEmail: {
                msg: "Please provide a valid email address."
                }
            }
        },

        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'A password is required.'
                },
                notEmpty: {
                    msg: "Please provide a password."
                },
            },
        },
    }, {sequelize});

    User.associate = (models) => {
        User.hasMany(models.Course, {
        as: 'student',
        foreignKey: {
            fieldName: 'studentId',
            allowNull: false,
            },
        });
    };

    return User;
};