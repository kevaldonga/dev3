'use strict';
const bcrypt = require('bcrypt');
const {
  Model, Sequelize, UUIDV1
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
    username: { type: DataTypes.STRING, allowNull: false, validate: { len: [5, 60] }, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    uuid: { type: DataTypes.UUID, allowNull: false, defaultValue: Sequelize.UUIDV4 },
    token: { type: DataTypes.UUID, allowNull: false, defaultValue: Sequelize.UUIDV1 }
  }, {
    sequelize,
    modelName: 'users',
  });

  users.beforeCreate('password', async (users, options) => {
    users.password = await bcrypt.hash(users.password, 15);
  });

  return users;
};