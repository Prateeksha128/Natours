const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const User = require('./userModel');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, ' A tour must have a name!'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour should not have more than 40 chars'],
      minlength: [10, 'A tour should not have less than 10 chars'],
      // validate: [validator.isAlpha, 'A tour name must contain characters only'],
    },
    duration: {
      type: String,
      required: [true, 'A tour must have a duration!'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size!'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty!'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty must be - easy or medium or difficult',
      },
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price!'],
    },

    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be between 1 to 5'],
      max: [5, 'Rating must be between 1 to 5'],
      set: (val) => Math.round(val * 10) / 10, // 4.666 => 46.6 => 47 => 4.7
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) must be less than the original price !!!',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description!'],
    },
    description: {
      type: String,
      trim: true,
    },
    secretTour: {
      type: Boolean,
      default: true,
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image!'],
    },
    slug: String,
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    startDates: [Date],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });


tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// virtual populate

tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

// document middleware : runs before .save() and .create()

tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Embedded user docs in tours model -BUT WE'RE NOT GOING TO USE IT INSTEAD WE USE REFERENCING MEANS STORE ONLY USER ID IN TOURS

// tourSchema.pre('save', async function (next) {
//   const guidePromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidePromises);
//   next();
// });

// QUERY MIDDLEWARE
// tourSchema.pre('find', function (next) {

tourSchema.pre(/^find/, function (next) {
  // this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});

tourSchema.post('find', function (doc, next) {
  console.log(`query took ${Date.now() - this.start} ms  👇👇👇👇`);
  next();
});

// AGGREGATION MIDDLEWARE

// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   console.log(this.pipeline());
//   next();
// });

// tourSchema.pre('save', function (next) {
//   console.log('will save doc!!!!');
//   next();
// });

// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
