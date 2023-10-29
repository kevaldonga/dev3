const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS,
    }
});

const send = async ({ to, subject, text, html }) => {
    const promise = transporter.sendMail({
        from: process.env.EMAIL,
        to: to,
        subject: subject,
        text: text,
        html: html,
    });

    return promise;
};

module.exports = send;
