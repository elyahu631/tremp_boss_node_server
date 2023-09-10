import nodemailer from 'nodemailer';
import { SentMessageInfo } from 'nodemailer';
import { EMAIL_PASS } from '../config/environment';
import { encrypt } from './Encryption';

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
    const encryptedToken = encrypt(token);

    const verificationLink = `http://localhost:5500/api/users/verify/${encryptedToken}`;

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


  public sendResetCode(to: string, code: number) {
    const mailOptions = {
        from: 'trempboss777@gmail.com',
        to: to,
        subject: 'Your Password Reset Code',
        text: `Your password reset code is: ${code}`,
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
