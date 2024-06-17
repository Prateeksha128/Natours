const express = require('express');
const reviewController = require('../controllers/reviewController');
// const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');

// ------CALL ROUTES-------//

const Router = express.Router({ mergeParams: true });

Router.use(authController.protect);

Router.route('/')
  .get(reviewController.getAllReviews)
  .post(authController.restrictTo('user'), reviewController.setTourUserIds, reviewController.createReview);

Router.route('/:id')
  .get(reviewController.getReview)
  .patch(authController.restrictTo('user', 'admin'), reviewController.updateReview)
  .delete(authController.restrictTo('user', 'admin'), reviewController.deleteReview);

module.exports = Router;
