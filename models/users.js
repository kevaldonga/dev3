'use strict';
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const {
  Model, Sequelize, Op
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

  users.beforeCreate('password', async (users, _) => {
    users.password = await bcrypt.hash(users.password, 15);
  });

  users.updatePassword = async (password, uuid) => {
    const hashedpassword = await bcrypt.hash(password, 15);
    const generateduuid = uuidv4();
    const userObj = { "password": hashedpassword, "uuid": generateduuid };
    await users.update(userObj, {
      where: {
        "uuid": {
          [Op.eq]: uuid,
        }
      }
    });
    return userObj;
  }
  return users;
};