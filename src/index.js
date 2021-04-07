const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

require('./controllers/userController')(app);
require('./controllers/projectController')(app);

app.listen(port, ()=> console.log('Api rodando na porta 3000'));
