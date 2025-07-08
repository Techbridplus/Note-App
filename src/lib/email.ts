import nodemailer from "nodemailer"

// Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendOTP(email: string, otp: string) {
  try {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: "Your OTP Code - Notes App",
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your OTP Code</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Notes App</h1>
            <p style="color: #f0f0f0; margin: 10px 0 0 0;">Secure Login Verification</p>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-bottom: 20px;">Your One-Time Password</h2>
            <p style="font-size: 16px; margin-bottom: 25px;">
              Hello! You've requested to sign in to your Notes App account. Please use the following OTP to complete your authentication:
            </p>
            
            <div style="background: #f8f9fa; border: 2px dashed #667eea; padding: 25px; text-align: center; margin: 25px 0; border-radius: 8px;">
              <div style="font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                ${otp}
              </div>
            </div>
            
            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; color: #856404;">
                <strong>⏰ Important:</strong> This code will expire in <strong>10 minutes</strong> for your security.
              </p>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 25px;">
              If you didn't request this code, please ignore this email. Your account remains secure.
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;">
            
            <p style="font-size: 12px; color: #999; text-align: center; margin: 0;">
              This is an automated message from Notes App. Please do not reply to this email.
            </p>
          </div>
        </body>
        </html>
      `,
      text: `
        Notes App - Your OTP Code
        
        Hello! You've requested to sign in to your Notes App account.
        
        Your One-Time Password is: ${otp}
        
        This code will expire in 10 minutes for your security.
        
        If you didn't request this code, please ignore this email.
        
        ---
        Notes App Team
      `,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log("Email sent successfully:", info.messageId)
    return true
  } catch (error) {
    console.error("Email sending failed:", error)
    return false
  }
}

// Test email configuration
export async function testEmailConnection() {
  try {
    await transporter.verify()
    console.log("SMTP connection is ready")
    return true
  } catch (error) {
    console.error("SMTP connection failed:", error)
    return false
  }
}
