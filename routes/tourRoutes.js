const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');

// ------CALL ROUTES-------//

const Router = express.Router();
// Router.param('id', tourController.checkID);

// Router.route('/:tourId/reviews').post(
//   authController.protect,
//   authController.restrictTo('user'),
//   reviewController.createReview,
// );

Router.use('/:tourId/reviews', reviewRouter);

Router.route('/tour-stats').get(tourController.getTourStats);
Router.route('/top-5-tours').get(tourController.aliasTopTours, tourController.getAllTours);

Router.route('/monthly-plan/:year').get(
  authController.protect,
  authController.restrictTo('admin', 'lead-guide', 'guide'),
  tourController.getMonthlyPlan,
);

Router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(tourController.getToursWithin);
//  /tours-within ?distance=233&center=-40,45&unit=mi
//  /tours-within/233/center/-40,45/unit/mi

Router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

Router.route('/')
  .get(tourController.getAllTours)
  .post(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.createTour);
Router.route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeUserPhoto,
    tourController.updateTour,
  )
  .delete(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.deleteTour);

module.exports = Router;
