const {Model, DataTypes} = require("sequelize");

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
            type: DataTypes.TEXT
        },

        estimatedTime: {
            type: DataTypes.STRING
        },

        materialsNeeded: {
            type: DataTypes.STRING
        }
        
    }, {sequelize});

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