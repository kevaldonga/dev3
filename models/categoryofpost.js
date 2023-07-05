'use strict';
const {
  Model, Sequelize
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class categoryOfPost extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.posts);
    }
  }
  categoryOfPost.init({
    type: { type: DataTypes.STRING, allowNull: false, validate: { len: [3, 20] } },
    postId: { type: DataTypes.INTEGER, allowNull: false },
    uuid: { type: DataTypes.UUID, allowNull: false, defaultValue: Sequelize.UUIDV4 },
  }, {
    sequelize,
    modelName: 'categoryOfPost',
  });
  return categoryOfPost;
};