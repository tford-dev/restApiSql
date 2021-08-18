const {Model, DataTypes} = require("sequelize");

//Schema for Course table
module.exports = (sequelize) => {
    class Course extends Model {};
    Course.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        title: {
            type: DataTypes.STRING,
            allowNull: false
        },

        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },

        estimatedTime: {
            type: DataTypes.STRING
        },

        materialsNeeded: {
            type: DataTypes.STRING
        }
        
    }, {sequelize});

    //Data association with student model
    Course.associate = (models) => {
        Course.belongsTo(models.User, {
            as: "student",
            foreignKey: {
                fieldName: "userId",
                allowNull: false,
            },
        });
    };

    return Course;
};