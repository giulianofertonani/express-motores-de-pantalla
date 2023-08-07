const express= require("express");
const session = require("express-session");
const flash = require("connect-flash");
const passport= require("passport");
const {create} =require("express-handlebars");
const csrf = require("csurf");
const User = require("./models/User");

require("dotenv").config();
require("./database/db");

const app= express();

app.use(
    session({
        secret: "keyboard michina",
        resave: false,
        saveUninitialized: false,
    name: "secret-name-salame"
    })
);
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user,done) =>
    done(null, {id: user.id, userName: user.userName}
));
passport.deserializeUser(async(user,done)=>{
    const userDB= await User.findById(user.id);
    return done(null, {id: user.id, userName: user.userName});
});

const hbs = create({
    extname:".hbs",
    partialsDir: ["views/components"]
});


// app.get("/ruta-protegida",(req,res)=>{
//     res.json(req.session.usuario || "sin sesión de usuario");
// });

// app.get("/crear-session",(req,res) =>{
//     req.session.usuario ="bluuweb";
//     res.redirect("/ruta-protegida");
// })

// app.get("/destruir-session", (req,res)=>{
//     req.session.destroy();
//     res.redirect("/ruta-protegida");
// })

app.engine(".hbs", hbs.engine);
app.set("view engine", ".hbs");
app.set("views", "./views");

app.use(express.static(__dirname +"/public"));
app.use(express.urlencoded({extended: true}));

app.use(csrf());

app.use((req, res, next)=>{
    res.locals.csrfToken = req.csrfToken();
    res.locals.mensajes= req.flash("mensajes");
    next();
});

app.use("/", require("./routes/home"));
app.use("/auth", require("./routes/auth"));

const PORT= process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor en puerto ` + PORT));

