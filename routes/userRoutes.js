const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

// CALL ROUTES //

const Router = express.Router();

// no need to login for these 4 routes
Router.post('/signup', authController.signup);
Router.post('/login', authController.login);
Router.get('/logout', authController.logout);
Router.post('/forgotPassword', authController.forgotPassword);
Router.patch('/resetPassword/:token', authController.resetPassword);

Router.use(authController.protect); //protect all routes after this middleware
Router.patch('/updateMyPassword', authController.updatePassword);
Router.patch('/updateMe', userController.uploadUserPhoto, userController.resizeUserPhoto, userController.updateMe);
Router.delete('/deleteMe', userController.deleteMe);
Router.get('/getMe', userController.getMe, userController.getUser);

Router.use(authController.restrictTo('admin')); // restrict all routes to perform action when user role is admin only
Router.route('/').get(userController.getAllUsers).post(userController.createUser);
Router.route('/:id').get(userController.getUser).patch(userController.updateUser).delete(userController.deleteUser);

module.exports = Router;
