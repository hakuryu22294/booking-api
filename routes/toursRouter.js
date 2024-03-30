const { Router } = require('express');
const {
  getAllTours,
  createTour,
  updateTour,
  deleteTour,
  getTour,
  getFeaturedTour,
  getToursStats,
  getMonthyPlan,
} = require('../controllers/tourController');

const toursRouter = Router();

toursRouter.route('/featured').get(getFeaturedTour, getAllTours);

toursRouter.route('/get-tours-stats').get(getToursStats);
toursRouter.route('/monthy-plan/:year').get(getMonthyPlan);

toursRouter.route('/').get(getAllTours).post(createTour);

toursRouter.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

module.exports = toursRouter;
