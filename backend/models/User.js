const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../db/conn');


const User = sequelize.define('usuario', {
  nome: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  senha: {
    type: DataTypes.STRING,
    allowNull: false
  },
  imagem: {
    type: DataTypes.STRING
  }
}, {
  timestamps: true
});

module.exports = User;
