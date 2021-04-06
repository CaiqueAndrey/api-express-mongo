const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authConfig = require('../config/auth');

const User = require('../models/User');

const router = express.Router();

router.post('/register', async (req, res) =>{
    const { email } = req.body;
    
    try {
        if(await User.findOne({email})){
            return res.status(400).send({ error: 'Email already exists'});
        }

        const user = await User.create(req.body);

        //não retornar a senha ao usuario
        user.password = undefined;

        return res.send({ user });

    }catch(err){
        return res.status(400).send({error: 'Registration failed'});
    }
});

router.post('/authenticate', async(req, res) =>{
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if(!user)
        return res.status(400).send({error: 'User not found'});

    if(!await bcrypt.compare(password, user.password)) //comparando a senha do login com a do BD
        return res.status(400).send({error: 'Invalid Password'});

    user.password = undefined;

    const token = jwt.sign({ id: user.id }, authConfig.secret, {
        expiresIn: 86400 //segundos
    });

    res.send({ user, token});
});

//repassando a rota com prefixo auth para o app
module.exports = app => app.use('/auth', router);