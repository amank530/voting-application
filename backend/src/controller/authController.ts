import { Request, Response } from 'express';
import { UserModel } from '../models/user';

// Simulated OTP storage in-memory
const activeOTPs: Record<string, string> = {
  '9876543210': '123456',
  '8888888888': '123456',
  '8888888889': '123456',
  '7777777777': '123456',
  '9999999999': '123456',
};

export const authController = {
  requestOtp: (req: Request, res: Response) => {
    const { mobileNumber } = req.body;
    if (!mobileNumber || mobileNumber.length < 10) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit mobile number.' });
    }
    
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    activeOTPs[mobileNumber] = generatedOtp;

    console.log(`[Firebase OTP Simulation] OTP for ${mobileNumber} is ${generatedOtp}`);

    return res.json({ 
      success: true, 
      message: 'OTP sent successfully (Simulated)',
      otp: generatedOtp
    });
  },

  verifyOtp: (req: Request, res: Response) => {
    const { mobileNumber, otp } = req.body;
    if (!mobileNumber || !otp) {
      return res.status(400).json({ error: 'Mobile number and OTP are required.' });
    }

    const storedOtp = activeOTPs[mobileNumber];
    if (storedOtp !== otp) {
      return res.status(401).json({ error: 'Invalid verification code. Please try again.' });
    }

    let user = UserModel.getUserByMobile(mobileNumber);
    if (!user) {
      user = UserModel.createUser({
        mobileNumber,
        name: `Voter-${mobileNumber.substring(6)}`,
        role: 'VOTER',
        isVerified: true,
        age: 18
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({ error: 'This account has been locked or suspended.' });
    }

    delete activeOTPs[mobileNumber];

    return res.json({
      success: true,
      user,
      token: `sim-jwt-${Buffer.from(JSON.stringify(user)).toString('base64').substring(0, 40)}`
    });
  }
};
