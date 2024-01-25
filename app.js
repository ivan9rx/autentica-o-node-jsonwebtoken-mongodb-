require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

//models
const User = require('./models/User');

app.get('/', (req, res) => {
    res.status(200).json({msg: "bem vindo a minha api"})
});

//registrar usuario

app.post('/auth/register', async(req,res) => {

    const {nome, email, senha, confirmarsenha} = req.body

    //validacoes

    if(!nome) {
        return res.status(422).json({msg: "nome é obrigatorio"})
    };

    if(!email) {
        return res.status(422).json({msg: "email é obrigatorio"})
    };

    if(!senha) {
        return res.status(422).json({msg: "senha é obrigatoria"})
    };

    if(senha !== confirmarsenha) {
        return res.status(422).json({msg:"as senhas não conferem!"})
    };

    //checando se o usuario ja existe
    const userExists = await User.findOne({email: email})

    if(userExists) {
        return res.status(422).json({msg: "por favor utiliz um email não cadastrado"})
    }

    //criar senha

    const salt = await bcrypt.genSalt(12);
    const senhaHash = await bcrypt.hash(senha, salt)

    //criar user

    const user = new User ({
        nome,
        email,
        senha: senhaHash
    })

    try{
        await user.save()

        res.status(201).json({msg: "usuario criado com sucesso"})

    } catch(error){
        res.status(500).json({msg: error})
    }
});

// logar usuario

app.post('/auth/login', async (req,res) => {
    const {email, senha} = req.body

    if(!email) {
        return res.status(422).json({msg: "email é obrigatorio"})
    };

    if(!senha) {
        return res.status(422).json({msg: "senha é obrigatoria"})
    };

    const user = await User.findOne({email: email})

    if(!user) {
        return res.status(404).json({msg: "user nao encontrado"})
    }

    //checar se a senha bate
    const checarSenha = await bcrypt.compare(senha, user,senha)

    if(!checarSenha) {
        return res.status(422).json({msg:'senha invalida'})
    }
})

mongoose.connect('mongodb+srv://fivan7580:ivanfilho41@cluster0.btz4qe9.mongodb.net/?retryWrites=true&w=majority').then(() => {
    app.listen(3000)
    console.log("conectou ao banco")
}).catch((err) => {console.log(err)});

