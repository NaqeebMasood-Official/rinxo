import bcrypt from "bcryptjs";
import User from "../models/User.model.js";
import { Payment } from "../models/payment.models.js";

export const uploadNICImages = async (req, res) => {
  try {
    const userData = req.user;

    if (!req.files?.frontImage || !req.files?.backImage) {
      return res.status(400).json({
        success: false,
        message: "Both front and back NIC images are required!",
      });
    }

    const frontImagePath = req.files.frontImage[0].path;
    const backImagePath = req.files.backImage[0].path;

    const user = await User.findOne({ email: userData.email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User does not exist!",
      });
    }

    if (["active", "pending"].includes(user.status)) {
      return res.status(400).json({
        success: false,
        message: `NIC already uploaded! Status: ${user.status}`,
      });
    }

    user.nic = {
      frontImage: frontImagePath,
      backImage: backImagePath,
    };
    user.status = "pending";

    await user.save();

    return res.status(201).json({
      success: true,
      message: "NIC uploaded successfully!",
      nicStatus: user.status,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Server Error: ${err.message}`,
    });
  }
};

export const showAllUsers = async (req, res) => {
  try {
    const userData = req.user;

    if (!userData) {
      return res.status(400).json({
        success: false,
        message: "User data not sent!",
      });
    }

    const user = await User.findOne({ email: userData.email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User with email: ${userData.email} does not exists!`,
      });
    }

    const users = await User.find({ role: "user" });

    if (!users) {
      return res.status(404).json({
        success: false,
        message: "Users do not exists!",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Users recieved successfully!",
      data: users,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Server Error: ${err.message}`,
    });
  }
};

export const showSingleUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized!",
      });
    }

    // Ensure requester exists (admin check can be middleware)
    const user = await User.findOne({
      _id: userId,
    });

    // const user = await User.findOne({
    //   _id: userId,
    //   role: "user",
    // }).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User retrieved successfully!",
      data: user,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Server Error: ${err.message}`,
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const idToDeleteUser = req.params.idToDeleteUser;

    const deleteUser = await User.deleteOne({ _id: idToDeleteUser });

    if (!deleteUser) {
      return res.status(404).json({
        success: false,
        message: `User id: not found!`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `User deleted successfully!`,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Server Error: ${err.message}`,
    });
  }
};

export const activateUser = async (req, res) => {
  try {
    const id = req.params.idToActivateUser;
    const status = req.body.status;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "User id not sent",
      });
    }

    const user = await User.findOne({ _id: id });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User not found!`,
      });
    }

    await User.updateOne({ _id: user._id }, { $set: { status: status } });

    return res.status(200).json({
      success: true,
      message: `User updated successfully!`,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Server Error: ${err.message}`,
    });
  }
};

export const showloggedInAdminData = async (req, res) => {
  try {
    const id = req.user._id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required!",
      });
    }

    const user = await User.findById({ _id: id });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User with id: ${id} is not found!`,
      });
    }

    return res.status(200).json({
      success: true,
      message: "User found successfully!",
      user: {
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Server Error: ${err.message}`,
    });
  }
};

export const updateAdminProfile = async (req, res) => {
  try {
    const id = req.params.id;
    const { fullName, phoneNumber } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "  ID is required",
      });
    }

    const admin = await User.findOne({ _id: id });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Not found",
      });
    }

    const updateData = {};

    if (fullName) updateData.fullName = fullName;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No changes provided",
      });
    }

    await User.updateOne({ _id: id }, { $set: updateData });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateAdminPassword = async (req, res) => {
  try {
    const id = req.params.id;
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current and new password are required",
      });
    }

    const admin = await User.findOne({ _id: id });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Not found",
      });
    }

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, admin.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    admin.password = hashedPassword;
    await admin.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const showAllPaymentsOrFunds = async (req, res) => {
  try {
    const payments = await Payment.find({});

    if (!payments) {
      return res.status(404).json({
        success: false,
        message: "Payments/Funds not found!",
      });
    }

    const users = await Promise.all(
      payments.map(async (payment) => {
        const user = await User.findById(payment.user_id);

        if (!user) return null;

        return {
          id: user._id,
          name: user.fullName,
          email: user.email,
          status: user.status,
          phoneNumber: user.phoneNumber,
        };
      })
    );

    return res.status(200).json({
      success: true,
      message: "Payments/Funds retrieved successfully!",
      payments,
      users,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Server Error: ${err.message}`,
    });
  }
};
