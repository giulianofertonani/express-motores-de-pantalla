const express= require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport= require("passport");
const mongoSanitize= require("express-mongo-sanitize");       
const cors = require("cors")  ;   
const {create} =require("express-handlebars");
const csrf = require("csurf");
const User = require("./models/User");

require("dotenv").config();
const clientDB = require("./database/db")

const app= express();

const corsOptions ={
    credentials: true,
    origin: process.env.PATHHEROKU||"*",
    methods:["GET","POST"],
};

app.use(cors())

app.set("trust proxy", 1);
app.use(
    session({
        secret: process.env.SECRETSESSION,
        resave: false,
        saveUninitialized: false,
        name: "session-user",
        store: MongoStore.create({
            clientPromise: clientDB,
            dbName: process.env.DBNAME,
        }),
        cookie: {
            secure: process.env.MODO === "production", 
            maxAge: 30 * 24 * 60 * 60 * 1000,
        },
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

app.use(mongoSanitize());

app.use((req, res, next)=>{
    res.locals.csrfToken = req.csrfToken();
    res.locals.mensajes= req.flash("mensajes");
    next();
});

app.use("/", require("./routes/home"));
app.use("/auth", require("./routes/auth"));

const port= process.env.PORT || 5000;
app.listen(port, () => console.log(`Servidor en puerto ` + port));



