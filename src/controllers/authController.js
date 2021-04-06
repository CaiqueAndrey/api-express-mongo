const express = require('express');

const User = require('../models/User');

const router = express.Router();

router.post('/register', async (req, res) =>{
    const { email } = req.body;
    
    try {
        if(await User.findOne())
            return res.status(400).send({ error: 'Email already exists'});

        const user = await User.create(req.body);

        //não retornar a senha ao usuario
        user.password = undefined;

        return res.send({ user });

    }catch(err){
        return res.status(400).send({error: 'Registration failed'});
    }
});

//repassando a rota com prefixo auth para o app
module.exports = app => app.use('/auth', router);