const User = require("../models/User");
const{validationResult} = require("express-validator");
const{nanoid} = require("nanoid");
const nodemailer = require("nodemailer");
require("dotenv").config()

const registerForm = (req,res) =>{
    return res.render("register")
};

const loginForm = (req,res) =>{
    return res.render("login")
};


const registerUser = async (req,res) =>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        // return res.json(errors)
        req.flash("mensajes", errors.array());
        return res.redirect("/auth/register")
    }

    const {userName, email, password} = req.body;
    try{
        let user = await User.findOne({email: email});
        if (user) throw new Error("ya existe el usuario");

        user = new User({userName, email, password, tokenConfirm: nanoid()});
        await user.save()

        const transport = nodemailer.createTransport({
            host: "sandbox.smtp.mailtrap.io",
            port: 2525,
            auth: {
              user: process.env.USERMAIL,
              pass: process.env.PASSEMAIL,
            }
          });

          await transport.sendMail({
            from: '"Fred Foo 👻" <foo@example.com>', // sender address
            to: user.email, // list of receivers
            subject: "Verifica tu cuenta de correo", // Subject line
            html: `<a href="${process.env.PATHHEROKU||"http://localhost:5000"}/auth/confirmar/${user.tokenConfirm}">Verifica tu cuenta aqui</a>`, // html body
          });

        req.flash("mensajes",[
            {msg: "Revisa tu correo electronico y valida tu cuenta",
        }]);
        return res.redirect("/auth/login")
    }catch(error){
        req.flash("mensajes",[{msg: error.message}]);
        return res.redirect ( "/auth/register")
    }
};

const confirmarCuenta = async(req,res) =>{
    const{ token } = req.params
    try{
        const user = await User.findOne({ tokenConfirm: token});
        if(!user) throw new Error("no existe este usuario");

        user.cuentaConfirmada = true;
        user.tokenConfirm = null;

        await user.save();

        req.flash("mensajes",[{msg: "Cuenta verificada, puedes iniciar sesion"}]);
        return res.redirect("/auth/login");
    }catch(error){
        // return res.json({error: error.message})
        req.flash("mensajes",[{msg: error.message}]);
        return res.redirect ( "/auth/login")
    }
};

const loginUser =async (req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        req.flash("mensajes", errors.array());
        return res.redirect("/auth/login")
    }
    
    const {email,password} =req.body;
    try{
        const user = await User.findOne({email});
        if (!user) throw new Error("No existe este email");

        if (!user.cuentaConfirmada)throw new Error("Falta confirmar cuenta");

        if (!await user.comparePassword(password))throw new Error("Contraseña invalida");

        // creando la sesion de usuario a traves de passport
        req.login(user, function (err){
            if(err) throw new Error("Error al crear la sesion");
        })
        return res.redirect("/"); 
    }catch(error){
        req.flash("mensajes",[{msg: error.message}]);
        return res.redirect ( "/auth/login")
        // console.log({error})
        // return res.send(error.message)
    }
};

const cerrarSesion = (req,res) =>{
    req.logout();
    return res.redirect ( "/auth/login");
}


module.exports = {
    loginForm,
    registerForm,
    registerUser,
    confirmarCuenta,
    loginUser,
    cerrarSesion,
}