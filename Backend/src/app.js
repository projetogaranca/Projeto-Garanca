const express = require('express');
const app = express();
const mongoose = require('mongoose');
const routes = require('./routes');
require('dotenv').config();

const port = process.env.PORT || 3000;
const uri = process.env.MONGODB_URI;
app.use(express.json());
app.use(((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
}
));
app.use(routes);

mongoose.connect(uri)
  .then(() => {
    app.listen(port, () => {
        console.log(`Banco de dados conectado e servidor rodando na porta ${port}`);
    });
})
  .catch(err => {console.error('Erro ao conectar ao banco de dados:', err); });