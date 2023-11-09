import nodemailer from 'nodemailer';
import { SentMessageInfo } from 'nodemailer';
import { EMAIL_PASS,TREMPBOSS_EMAIL } from '../config/environment';
import { encrypt } from './Encryption';
import { BadRequestException } from '../middleware/HttpException';

export class EmailService {
  private readonly transporter: nodemailer.Transporter;

  static OUR_EMAIL = TREMPBOSS_EMAIL

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: EmailService.OUR_EMAIL,
        pass: EMAIL_PASS,
      },
    });
  }

  public sendVerificationEmail(to: string, token: string) {
    const encryptedToken = encrypt(token);

    const verificationLink = `https://tremp-boss-api.cyclic.app/api/users/verify/${encryptedToken}`;

    const mailOptions = {
      from: EmailService.OUR_EMAIL,
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
      from: EmailService.OUR_EMAIL,
      to: to,
      subject: 'Your Password Reset Code',
      text: `Your password reset code is: ${code}`,
    };

    this.transporter.sendMail(mailOptions, (error: Error | null, info: SentMessageInfo) => {
      if (error) {
        throw new BadRequestException("email dosnot sent ");
      } else {
        console.log('Email sent:', info);
      }
    });
  }
}
