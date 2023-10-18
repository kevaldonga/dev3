'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    queryInterface.changeColumn("posts", "readDuration", {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    queryInterface.changeColumn("posts", "readDuration", {
      type: Sequelize.DATE,
      allowNull: false,
    });
  }
};
