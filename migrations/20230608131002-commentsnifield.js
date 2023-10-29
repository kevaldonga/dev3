'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    queryInterface.addColumn('comments', 'comment', {
      type: Sequelize.STRING,
      allowNull: false,
      validate: { len: [10, 255] },
    });
  },

  async down(queryInterface, Sequelize) {
    queryInterface.removeColumn('comments', 'comment');
  }
};
