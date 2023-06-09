'use strict';
const {
  Model, UUIDV4, UUIDV1
} = require('sequelize');
const profiles = require('./profiles');
module.exports = (sequelize, DataTypes) => {
  class users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasOne(models.profiles, { as: 'profiles', sourceKey: 'id', foreignKey: 'userId' })
    }
  }
  users.init({
    username: { type: DataTypes.STRING, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: 0 },
    uuid: { type: DataTypes.UUID, allowNull: false, defaultValue: UUIDV4 },
    token: { type: DataTypes.UUID, allowNull: false, defaultValue: UUIDV1 }
  }, {
    sequelize,
    modelName: 'users',
  });
  return users;
};