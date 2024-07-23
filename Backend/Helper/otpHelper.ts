import nodemailer from 'nodemailer'

const sendOTP = async(email:string,otp:string)=>{
   try{
   console.log('thasni')
    console.log('email = ',email)
    console.log('otp = ',otp)
    console.log('user_email = ', process.env.USER_EMAIL)
    console.log('user_email = ', process.env.USER_PASSWORD)
    const transporter = nodemailer.createTransport({
       service: 'gmail',
       auth: {
         user: process.env.USER_EMAIL,
         pass: process.env.USER_PASSWORD,
       },
    });
    console.log(transporter)
   
    const mailOptions = {
       from: process.env.USER_EMAIL,
       to: email,
       subject: 'Your OTP',
       text: `Your OTP is: ${otp}`,
    };
    console.log(mailOptions)
   
    await transporter.sendMail(mailOptions);
   }
   catch (error) {
      if (error instanceof Error) {
          console.log(error.message);
      } else {
          console.log('An unknown error occurred');
      }
  }
   }

   export default sendOTP