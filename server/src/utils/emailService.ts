import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Твой email (добавим в .env)
        pass: process.env.EMAIL_PASS, // Пароль приложения (не от аккаунта!)
    },
});

export const sendVerificationEmail = async (email: string, token: string) => {
    const verificationLink = `http://localhost:3000/api/auth/verify/${token}`; // Ссылка на наш бэкенд

    try {
        await transporter.sendMail({
            from: '"Task 4 App" <no-reply@task4.com>',
            to: email,
            subject: 'Welcome! Please verify your email',
            html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Welcome to Task 4!</h2>
        <p>Please click the link below to verify your email address:</p>
        <p>
          <a href="${verificationLink}" style="background-color: #0d6efd; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Verify Email
          </a>
        </p>
        <p><small>Or copy this link: ${verificationLink}</small></p>
      </div>
    `,
        });
        console.log(`Verification email sent to ${email}`);
    } catch (error) {
        console.error('Email sending failed:', error);
    }
};
