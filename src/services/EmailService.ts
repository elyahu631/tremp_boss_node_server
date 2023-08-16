import nodemailer from 'nodemailer';
import { SentMessageInfo } from 'nodemailer';
import { EMAIL_PASS } from '../config/environment';

export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'trempboss777@gmail.com', 
        pass: EMAIL_PASS,
      },
    });
  }

  public sendVerificationEmail(to: string, token: string) {
    const verificationLink = `http://your-app.com/verify?token=${token}`;
    const mailOptions = {
      from: 'trempboss777@gmail.com',
      to: to,
      subject: 'Verify Your Email',
      text: `Please click on the link to verify your email: ${verificationLink}`,
    };

    this.transporter.sendMail(mailOptions, (error: Error | null, info: SentMessageInfo) => {
      if (error) {
        console.log('Error sending email:', error);
      } else {
        console.log('Email sent:', info);
      }
    });
  }
}
