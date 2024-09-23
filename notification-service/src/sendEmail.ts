import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: 'maildev',
  port: 1025,
  ignoreTLS: true,
});

export const sendEmailNotification = async (matchResult: any) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'thanmaibk@gmail.com', // Replace with the recipient's email
    subject: 'New Job Match Found',
    text: `You have a new job match with a score of ${matchResult.score}.

Reasoning: ${matchResult.reasoning}
Job ID: ${matchResult.jobId}
Resume ID: ${matchResult.resumeId}
`,
  };

  await transporter.sendMail(mailOptions);
};
