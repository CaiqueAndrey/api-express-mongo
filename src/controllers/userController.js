const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middlewares/auth');

const authConfig = require('../config/auth');

const User = require('../models/User');

const router = express.Router();

// const unprotectedPath = {
//     path:[
//         {url: }
//     ]
// }

//router.use(authMiddleware);

function generateToken(params = {}) {
    return jwt.sign(params, authConfig.secret,{
        expiresIn: 86400 //segundos
    });
}

router.get('/', async (req, res) =>{
    try{
        const users = await User.find();

        return res.send({
            users
        });
    }catch(err){
        return res.status(400).send({error: 'No users'});
    }
});

router.get('/:email', async (req, res) =>{
    const { email } = req.body;
    try{
        const users = await User.find();

        return res.send({
            users
        });
    }catch(err){
        return res.status(400).send({error: 'No users'});
    }
});

router.put('/:_id', async (req, res) => {
    const { email } = req.body;
    const userId = req.params._id;

    try{
        if(await User.findOne({email}))
            return res.status(400).send({ error: 'Email already exists'});
        

        if(await User.findOneAndUpdate({_id: userId}, req.body))
            return res.status(200).send({message:"Success"});
        
    }catch(err){
        return res.status(400).send({error: 'Error on update'});
    }
});

router.post('/register', async (req, res) =>{
    const { email } = req.body;
    
    try {
        if(await User.findOne({email})){
            return res.status(400).send({ error: 'Email already exists'});
        }

        const user = await User.create(req.body);

        //não retornar a senha ao usuario
        user.password = undefined;

        return res.send({ 
            user,
            token: generateToken({id: user.id}) //token de auth apos registrar
        });

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


    res.send({ 
        user,
        token: generateToken({id: user.id})
    });
});


router.delete('/:_id', async (req, res) =>{
    const userId = req.params._id;
    try{
        if(await User.deleteOne({_id: userId}))
            return res.status(200).send({message:"Success on delete"});
    }catch(err){
        return res.status(400).send({error: 'Error on delete user'});
    }
});

//repassando a rota com prefixo auth para o app
module.exports = app => app.use('/users', router);