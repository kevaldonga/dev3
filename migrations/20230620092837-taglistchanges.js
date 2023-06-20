'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // color
    queryInterface.addColumn("tagLists", "color", {
      type: Sequelize.CHAR(7),
      allowNull: false,

    });
    // image
    queryInterface.addColumn("tagLists", "image", {
      type: Sequelize.STRING,
      allowNull: false,
    });
    // description
    queryInterface.addColumn("tagLists", "description", {
      type: Sequelize.STRING,
      allowNull: true,
    });

  },

  async down(queryInterface, Sequelize) {
    // color
    queryInterface.removeColumn("tagLists", "color");
    // image
    queryInterface.removeColumn("tagLists", "image");
    // description
    queryInterface.removeColumn("tagLists", "description");
  }
};
