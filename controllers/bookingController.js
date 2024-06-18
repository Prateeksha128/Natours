const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
// const AppError = require('../utils/appError');
const Tour = require('../models/tourModel');
// const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const Booking = require('../models/bookingModel');
const User = require('../models/userModel');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  //  1. Get the currently booked tour

  const tour = await Tour.findById(req.params.tourId);

  // 2. Create checkout session

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    // success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
    success_url: `${req.protocol}://${req.get('host')}/my-tours?alert=booking`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${tour.name} tour`,
            description: tour.summary,
            images: [`${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`],
          },
          unit_amount: tour.price * 100,
        },
        quantity: 1,
      },
    ],
  });
  // 3. Create session as response
  res.status(200).json({
    status: 'success',
    session,
  });
});

// exports.createBookingCheckout = catchAsync(async (req, res, next) => {
//   // THIS IS ONLY TEMPORARY, BECAUSE IT IS UNSECURE : EVERYONE CAN MAKE A BOOKING WITHOUT PAY THE AMOUNT BY JUST HITTING THE SUCCESS URL WITH CORRECT PARAMETERS

//   const { tour, user, price } = req.query;
//   if (!tour && !user && !price) return next();
//   await Booking.create({ tour, user, price });
//   // res.redirect(req.originalUrl.split('?')[0]);
//   res.redirect(`${req.protocol}://${req.get('host')}/my-tours`);
// });

const createBookingCheckout = async (session) => {
  try {
    console.log('in createBookingCheckout');
    console.log('Session:', session);
    const tour = session.client_reference_id;
    const user = (await User.findOne({ email: session.customer_email })).id;
    const price = session.line_items[0].amount / 100;
    console.log(tour, user, price);
    await Booking.create({ tour, user, price });
  } catch (error) {
    console.error('Error in createBookingCheckout:', error);
  }
};

exports.webhookCheckout = async (req, res, next) => {
  console.log('in webhookCheckout');
  const signature = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  console.log(event);

  if (event.type === 'checkout.session.completed') {
    try {
      await createBookingCheckout(event.data.object);
    } catch (error) {
      console.error('Error processing webhook event:', error);
      return res.status(500).send('Internal Server Error');
    }
  }

  res.status(200).json({ received: true });
};

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBooking = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
