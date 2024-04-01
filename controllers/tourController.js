const Tour = require('../models/tourSchema');
const APIQueries = require('../utils/apiQueries');
const catchAsync = require('../errors/catchAsync');
const globalError = require('../errors/globalError');
/**
 * Create a new tour.
 * @param {Object} req - The request object containing tour data in the request body.
 * @param {Object} res - The response object to send back to the client.
 * @param {Function} next - The next middleware function in the stack.
 * @returns {JSON} A JSON response indicating the status of the operation and the newly created tour data.
 */

exports.getFeaturedTour = catchAsync(async (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
});

exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});

exports.getAllTours = catchAsync(async (req, res, next) => {
  const apiQueries = new APIQueries(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const tours = await apiQueries.query;

  res.status(200).json({
    status: 'success',
    results: tours.length,

    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);
  // if (!tour) return next(new globalError('No tour found with that ID', 404));

  // res.status(200).json({
  //   status: 'success',
  //   data: {
  //     tour,
  //   },
  // });
  tour
    ? res.status(200).json({
        status: 'success',
        data: {
          tour,
        },
      })
    : next(new globalError('No tour found with that ID', 404));
});

exports.getToursStats = catchAsync(async (req, res, next) => {
  console.log('Getting tour');
  const stats = await Tour.aggregate([
    {
      $match: {
        ratingsAverage: { $gte: 4.5 },
        // difficulty: { $ne: 'easy' }
      },
    },
    {
      $group: {
        _id: '$difficulty',
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: stats,
  });
});

exports.getMonthyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lt: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: { _id: 0 },
    },
    {
      $sort: { numTourStarts: -1 },
    },
  ]);
  res.status(201).json({
    status: 'success',
    data: {
      tour: plan,
    },
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  newTour
    ? res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      })
    : next(new globalError('No tour found with that ID', 404));
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  tour
    ? res.status(204).json({
        status: 'success',
        data: null,
      })
    : next(new globalError('No tour found with that ID', 404));
});
