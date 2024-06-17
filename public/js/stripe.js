/* eslint-disable */

import axios from 'axios';
import { showAlert } from './alerts';

export const bookTour = async (tourId) => {
  const stripe = Stripe(
    'pk_test_51PSXRFSGb6QDWemij07jY34k2tNOx3FLMsxO5Tzj7nxwOxozI35UDLElE1cL1bD2B3ywQYQPJ0TivX2SB5gtLYCd00r4vfQ6VU',
  );
  try {
    // 1. Get checkout session from API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    console.log(session);
    // 2. Create checkout form + charge credit card

    // await stripe.redirectToCheckout({
    //   sessionId: session.data.session.id,
      // });
      window.location.replace(session.data.session.url);
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
