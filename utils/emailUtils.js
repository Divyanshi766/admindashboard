require('dotenv').config();
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',  
  port: process.env.SMTP_PORT || 587, 
  secure: false,  
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS,
  },
});
const sendUserEmail = (userEmail, userPassword) => {
  const mailOptions = {
    from: `"Divya Gupta" <dg9772242@gmail.com>`,  
    to: ' ',  
    subject: 'New User Created',  
    text: `Hi Divyanshi, a new user has been created.\n\nUser Email: ${userEmail}\nUser Password: ${userPassword}`, 
    html: `<p>Hi Divyanshi,</p><p>A new user has been created:</p><p><strong>User Email:</strong> ${userEmail}</p><p><strong>User Password:</strong> ${userPassword}</p>`, 
  };

 
  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error('Error occurred while sending email:', err);
    } else {
      console.log('Email successfully sent:', info.response);
    }
  });
};
// const newUserEmail = 'newuser@example.com';
// const newUserPassword = 'randomGeneratedPassword123';  

// sendUserEmail(newUserEmail, newUserPassword);
