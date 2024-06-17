const mongoose = require('mongoose');

const dontenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('Uncaught exception : shutting down🛑');
  console.log(err);
  console.log(err.name, err.message);
  process.exit(1);
});

dontenv.config({ path: './config.env' });

const app = require('./app');

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    // useUnifiedTopology: true,
  })
  .then(() => {
    // console.log(conn);
    console.log('DB CONNECTION SUCCESSFUL!!!!!');
  });

// const testTour = new Tour({
//   name: 'The Sky Hiker',
//   price: 399,
//   rating: 4.6,
// });

// testTour
//   .save()
//   .then((doc) => {
//     console.log(doc);
//   })
//   .catch((err) => {
//     console.log('Error!!', err);
//   });

const port = process.env.PORT || 1200;

const server = app.listen(port, () => {
  console.log(`App now running on port ${port}..................`);
});

process.on('unhandledRejection', (err) => {
  // console.log(err);
  // console.log(err.name);
  console.log('Unhandler rejection : shutting down🛑');
  server.close(() => {
    process.exit(1);
  });
});

