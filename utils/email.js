const nodemailer = require('nodemailer');
const pug = require('pug');
const { convert } = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Prateeksha Sharma <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // sendgrid
      return 1;
    }
    return nodemailer.createTransport({
      //   service : 'Gmail',
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
      //   activate in gmail "less secure app" option
    });
  }

  // send the actual email

  async send(template, subject) {
    // 1. render HTML based on the pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });

    // 2. Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: convert(html),
    };

    // 3. Create a transport and semd email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family!');
  }

  async sendPasswordReset() {
    await this.send('passwordReset', 'Your password reset token (valid for only 10 minutes)');
  }
};

// --------------------------------------  OLD ONE -----------------------------------------------//

// const sendEmail = async (options) => {
//   // 1. CREATE A TRANSPORTER

//   const transporter = nodemailer.createTransport({
//     //   service : 'Gmail',
//     host: process.env.EMAIL_HOST,
//     port: process.env.EMAIL_PORT,
//     auth: {
//       user: process.env.EMAIL_USERNAME,
//       pass: process.env.EMAIL_PASSWORD,
//     },
//     //   activate in gmail "less secure app" option
//   });

//   // 2. DEFINE THE EMAIL OPTIONS

//   const mailOptions = {
//     from: 'Prateeksha Sharma <tiksha@jk.io>',
//     to: options.email,
//     subject: options.subject,
//     text: options.message,
//     // html :
//   };

//   // 3. ACTUALLY SEND THE EMAIL
//   await transporter.sendMail(mailOptions);
// };

// module.exports = sendEmail;
