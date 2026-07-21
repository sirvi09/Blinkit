import sendEmail from "../config/sendEmail.js";
import {
  createUser,
  findUserByEmail,
  findUserById,
} from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import verifyEmailTemplate from "../utils/verifyEmailTemplate.js";
import generatedAccessToken from "../utils/generatedAccessToken.js";
import generatedRefreshToken from "../utils/generatedRefreshToken.js";
import { pool } from "../config/connectDB.js";
import uploadImageCloudinary from "../utils/uploadimageCloudinary.js";
import generateOtp from "../utils/generatedOtp.js";
import forgotPasswordTemplate from "../utils/forgotPasswordTemplate.js";
import jwt from "jsonwebtoken";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export async function registerUserController(req, res) {
  try {
    const parsed = registerSchema.safeParse(req.body || {});
    if (!parsed.success) {
      return res.status(400).json({
        message: parsed.error.errors[0].message,
        error: true,
        success: false,
      });
    }

    const { name, email, password } = parsed.data;
    const user = await findUserByEmail(email);

    if (user) {
      return res.json({
        message: "Already registered email",
        error: true,
        success: false,
      });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashPassword = await bcryptjs.hash(password, salt);

    const newUser = await createUser({
      name,
      email,
      password: hashPassword,
    });

    const verificationToken = jwt.sign({ id: newUser.id }, process.env.SECRET_KEY_ACCESS_TOKEN, { expiresIn: '1d' });
    const VerifyEmailUrl = `${process.env.FRONTEND_URL}/verify-email?code=${verificationToken}`;

    await sendEmail({
      sendTo: email,
      subject: "Verify email from Winkit",
      html: verifyEmailTemplate(name, VerifyEmailUrl),
    });

    return res.json({
      message: "User registered successfully",
      error: false,
      success: true,
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
      }
    });
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: true,
      success: false,
    });
  }
}

export async function verifyEmailController(req, res) {
  try {
    const { code } = req.body || {};
    if(!code) {
        return res.status(400).json({ message: "Verification code required", error: true, success: false });
    }

    let userId;
    try {
        const decoded = jwt.verify(code, process.env.SECRET_KEY_ACCESS_TOKEN);
        userId = decoded.id;
    } catch(err) {
        return res.status(400).json({ message: "Invalid or expired verification code", error: true, success: false });
    }

    const user = await findUserById(userId);

    if (!user) {
      return res.status(400).json({
        message: "User not found",
        error: true,
        success: false,
      });
    }

    await pool.query("UPDATE users SET verify_email = true WHERE id = $1", [
      userId,
    ]);

    return res.json({
      message: "Verify email done",
      success: true,
      error: false,
    });
  } catch (error) {
    console.error("Verify Email Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: true,
      success: false,
    });
  }
}

export async function loginController(req, res) {
  try {
    const parsed = loginSchema.safeParse(req.body || {});
    if (!parsed.success) {
      return res.status(400).json({
        message: parsed.error.errors[0].message,
        error: true,
        success: false,
      });
    }

    const { email, password } = parsed.data;
    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(400).json({
        message: "User not registered",
        error: true,
        success: false,
      });
    }

    if (user.status !== "Active") {
      return res.status(400).json({
        message: "Account inactive, please contact Admin",
        error: true,
        success: false,
      });
    }

    const checkpassword = await bcryptjs.compare(password, user.password);

    if (!checkpassword) {
      return res.status(400).json({
        message: "Invalid credentials",
        error: true,
        success: false,
      });
    }

    const accesstoken = await generatedAccessToken(user.id);
    const refreshToken = await generatedRefreshToken(user.id);

    const cookiesOption = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? "None" : "Lax",
    };

    res.cookie("accessToken", accesstoken, cookiesOption);
    res.cookie("refreshToken", refreshToken, cookiesOption);

    return res.json({
      message: "Login successfully",
      error: false,
      success: true,
      data: {
        accesstoken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: true,
      success: false,
    });
  }
}

export async function logoutController(req, res) {
  try {
    const userid = req.userId;

    const cookiesOption = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? "None" : "Lax",
    };

    res.clearCookie("accessToken", cookiesOption);
    res.clearCookie("refreshToken", cookiesOption);

    await pool.query(
      `UPDATE users 
       SET refresh_token = '', last_login_date = NOW() 
       WHERE id = $1`,
      [userid],
    );
    return res.json({
      message: "Logout successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    console.error("Logout Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: true,
      success: false,
    });
  }
}

export async function uploadAvatar(req, res) {
  try {
    const userId = req.userId;
    const image = req.file;

    if (!image) {
      return res.status(400).json({
        message: "Image not provided",
        error: true,
        success: false,
      });
    }

    const upload = await uploadImageCloudinary(image);

    await pool.query("UPDATE users SET avatar = $1 WHERE id = $2", [
      upload.secure_url,
      userId,
    ]);

    return res.json({
      message: "upload profile",
      data: {
        id: userId,
        avatar: upload.secure_url,
      },
      success: true,
      error: false,
    });
  } catch (error) {
    console.error("Upload Avatar Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: true,
      success: false,
    });
  }
}

export async function updateUserDetails(req, res) {
  try {
    const userId = req.userId; 
    const { name, email, mobile, password } = req.body;

    let hashPassword = "";

    if (password) {
      const salt = await bcryptjs.genSalt(10);
      hashPassword = await bcryptjs.hash(password, salt);
    }

    await pool.query(
      `UPDATE users 
         SET 
         name = COALESCE($1,name),
         email = COALESCE($2,email),
         mobile = COALESCE($3,mobile),
         password = COALESCE($4,password),
         updated_at = CURRENT_TIMESTAMP
         WHERE id = $5`,
      [name, email, mobile, hashPassword || null, userId],
    );

    return res.json({
      message: "Updated successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    console.error("Update User Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: true,
      success: false,
    });
  }
}

export async function forgetPasswordController(req, res) {
  try {
    const { email } = req.body;

    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(400).json({
        message: "Email not available",
        error: true,
        success: false,
      });
    }

    const otp = generateOtp();
    const expireTime = new Date(Date.now() + 60 * 60 * 1000);

    await pool.query(
      `UPDATE users 
         SET forget_password_otp = $1,
             forget_password_expiry = $2
         WHERE id = $3`,
      [otp, expireTime, user.id],
    );

    await sendEmail({
      sendTo: email,
      subject: "Forget password from Winkit ",
      html: forgotPasswordTemplate({
        name: user.name,
        otp: otp,
      }),
    });

    return res.json({
      message: "check your email",
      error: false,
      success: true,
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: true,
      success: false,
    });
  }
}

export async function verifyForgetPasswordOtp(req, res) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Provide required field email, otp.",
        error: true,
        success: false,
      });
    }

    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(400).json({
        message: "User not found",
        error: true,
        success: false,
      });
    }

    const currentTime = new Date();

    if (user.forget_password_expiry < currentTime) {
      return res.status(400).json({
        message: "Otp is expired",
        error: true,
        success: false,
      });
    }

    if (otp !== user.forget_password_otp) {
      return res.status(400).json({
        message: "Invalid otp",
        error: true,
        success: false,
      });
    }

    await pool.query(
      `UPDATE users 
        SET forget_password_otp = NULL,
       forget_password_expiry = NULL
        WHERE id = $1`,
      [user.id],
    );

    return res.json({
      message: "Verify otp successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: true,
      success: false,
    });
  }
}

export async function resetpassword(req, res) {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    if (!email || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "provide required fields email, newPassword, confirmPassword",
        error: true,
        success: false,
      });
    }

    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(400).json({
        message: "Email is not available",
        error: true,
        success: false,
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "newPassword and confirmPassword must be same.",
        error: true,
        success: false,
      });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashPassword = await bcryptjs.hash(newPassword, salt);

    await pool.query(
      `UPDATE users 
             SET password = $1,
                 forget_password_otp = NULL,
                 forget_password_expiry = NULL,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $2`,
      [hashPassword, user.id],
    );

    return res.json({
      message: "Password updated successfully.",
      error: false,
      success: true,
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: true,
      success: false,
    });
  }
}

export async function refreshToken(req, res) {
  try {
    const token =
      req.cookies.refreshToken || req?.headers?.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Invalid token",
        error: true,
        success: false,
      });
    }

    const verifyToken = jwt.verify(token, process.env.SECRET_KEY_REFRESH_TOKEN);

    if (!verifyToken) {
      return res.status(401).json({
        message: "token is expired",
        error: true,
        success: false,
      });
    }

    const userId = verifyToken?.id;

    const newAccessToken = await generatedAccessToken(userId);

    const cookiesOption = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? "None" : "Lax",
    };

    res.cookie("accessToken", newAccessToken, cookiesOption);

    return res.json({
      message: "New Access token generated",
      error: false,
      success: true,
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    console.error("Refresh Token Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: true,
      success: false,
    });
  }
}

export async function userDetails(req, res) {
  try {
    const userId = req.userId;

    const result = await pool.query(
       `SELECT id, name, email, avatar, mobile, verify_email, last_login_date, status, role FROM users WHERE id = $1`,
      [userId],
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        error: true,
        success: false,
      });
    }

    return res.json({
      message: "user details",
      data: user,
      error: false,
      success: true,
    });
  } catch (error) {
    console.error("User Details Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: true,
      success: false,
    });
  }
}
