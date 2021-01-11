const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

// User model
const User = require('../models/User');

// Login Page
router.get('/login', (req, res) => res.render('login'));

// Register Page
router.get('/register', (req, res) => res.render('register'));

// Resgister Handle
router.post('/register', (req, res) => {
    const { name, email, password, password2} = req.body;

    let errors = [];

    // Check required fields
    if(!name || !email || !password || !password2) {
        errors.push ({msg: 'Por favor preencha todos os campos'});
    }

    // Check password match
    if(password !== password2) {
        errors.push({ msg: 'As senhas não são iguais' });
    }

    // Check password length
    if(password.length < 6) {
        errors.push({ msg: 'A senha deve ter no mínimo 6 caracteres'})
    } 

    if(errors.length > 0) {
        res.render('register', {
            errors,
            name,
            email,
            password,
            password2

        });
    } else {
        // Validation passed
        User.findOne({ email: email})
          .then(user => {
              if(user) {
                 // User exists
                 errors.push({ msg: 'Email is already registred'});
                 res.render('register', {
                    errors,
                    name,
                    email,
                    password,
                    password2
        
                });
              } else {

                // Create new user does not save
                  const newUser = new User({
                      name,
                      email,
                      password
                  });

                  // Hash password
                  bcrypt.genSalt(10, (err, salt) => 
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if(err) throw err;
                        // Set password to hashed
                        newUser.password = hash;
                        // Save user
                        newUser.save()
                          .then(user => {
                              req.flash('success_msg', 'Você foi registrado com sucesso e pode fazer login');
                              res.redirect('/users/login');
                          })
                          .catch(err => console.log(err));
                    }))
              }
          });

    }
});

// Login Handle
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

// Logout Handle
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'Você fez logout');
    res.redirect('/users/login');
});

module.exports = router;