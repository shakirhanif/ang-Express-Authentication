require('dotenv').config();

const express = require('express');
const bodyparser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
// const encrypt = require('mongoose-encryption');
// const md5 = require('md5');
// const bcrypt = require('bcrypt');
// const saltRounds = 10;
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

const app = express();

app.use(express.static('public'));
app.set('view engine','ejs');
app.use(bodyparser.urlencoded({extended:true}));
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    //cookie: { secure: true }
  }));
app.use(passport.initialize());
app.use(passport.session());


mongoose.connect('mongodb://localhost:27017/userDB',{useNewUrlParser:true});

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);
// userSchema.plugin(encrypt, { secret: process.env.SECRET,encryptedFields: ['password'] });

const User = new mongoose.model('User',userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.get('/',function (req,res) {
    res.render('home');
});

app.get('/login',function (req,res) {
    res.render('login');
});
app.post('/login',function (req,res) {

    const user=new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user,function (err) {
        if (err) {
            console.log(err);
        }else{
            passport.authenticate('local')(req,res,function() {
                res.redirect('/secrets'); 
            });
        }
    });

app.get('/logout',function (req,res) {
    req.logout(function (err) {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/');
        }
        
    });
});




    ////bcrypt//
    // const username = req.body.username;
    // const password = req.body.password; //md5(req.body.password);
    // User.findOne({email: username},function (err,found_user) {
    //     if (err) {
    //         console.log(err);
    //     }else{
    //         if (found_user){
    //             bcrypt.compare(password, found_user.password, function(err, result) {
    //                 if (result) {
    //                     res.render('secrets');
    //                 }else{
    //                     res.send("password not correct");
    //                 }
    //             });
    //         }
    //     }
    // });
});


app.get('/register',function (req,res) {
    res.render('register');
});

app.get('/secrets',function (req,res) {
    if (req.isAuthenticated()) {
        res.render('secrets');
    }else{
        res.redirect('/login');
    }
});

app.post('/register',function (req,res) {
    
    User.register({username: req.body.username},req.body.password,function (err,user) {
        if (err) {
            console.log(err);
            res.redirect('/register');
        } else {
            passport.authenticate('local')(req,res,function() {
                res.redirect('/secrets');
            });
        }
    })
    
    
    
    
    ////bcrypt///
    // bcrypt.hash(req.body.password , saltRounds, function(err, hash) {
    //     const new_user = new User({
    //         email: req.body.username,
    //         password: hash
    //     });
    //     new_user.save(function (err) {
    //         if (!err) {
    //             res.render('secrets');
    //         }
    //     });
    // });
    ////simple 1////
    // const new_user = new User({
    //     email: req.body.username,
    //     password: req.body.password //md5(req.body.password)
    // });

    // new_user.save(function (err) {
    //     if (!err) {
    //         res.render('secrets');
    //     }
    // });
});







app.listen('4000',function () {
    console.log('server started at 4000');
});
