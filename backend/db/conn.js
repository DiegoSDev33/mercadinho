const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('mercadinho', 'root', '@admin123', {
  host: '127.0.0.1',
  dialect: 'mysql'
  // outras opções de configuração, se necessário
});

// Testa a conexão com o banco de dados
sequelize.authenticate()
  .then(() => {
    console.log('Conectamos ao banco de dados mysql!!!');
  })
  .catch(err => {
    console.error('Erro ao conectar ao banco de dados:', err);
  });

module.exports = sequelize;
