'use strict';
const {
  Model, Sequelize
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasOne(models.profiles, { as: 'profiles', sourceKey: 'id', foreignKey: 'userId' });
    }
  }
  users.init({
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    uuid: { type: DataTypes.UUID, allowNull: false, defaultValue: Sequelize.UUIDV4 },
    token: DataTypes.UUID
  }, {
    sequelize,
    modelName: 'users',
  });
  return users;
};