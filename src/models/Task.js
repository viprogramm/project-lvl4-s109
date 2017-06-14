import Sequelize from 'sequelize';

export default connect => connect.define('Task', {
  name: {
    type: Sequelize.STRING,
    validate: {
      notEmpty: true,
    },
  },
  description: {
    type: Sequelize.TEXT,
  },
  statusId: {
    type: Sequelize.INTEGER,
    validate: {
      notEmpty: true,
    },
    defaultValue: 1,
  },
  creatorId: {
    type: Sequelize.INTEGER,
    validate: {
      notEmpty: true,
    },
  },
  assignedToId: {
    type: Sequelize.INTEGER,
  },
}, {
  freezeTableName: true, // Model tableName will be the same as the model name
});
