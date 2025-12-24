import User from "../models/User.model.js";

export const uploadNICImages = async (req, res) => {
  try {
    const userData = req.body.user;

    if (!req.files?.frontImage || !req.files?.backImage) {
      return res.status(400).json({
        success: false,
        message: "Both front and back NIC images are required!",
      });
    }

    const frontImage = req.files.frontImage;
    const backImage = req.files.backImage;

    const user = await User.findOne({ email: userData.email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User does not exists!",
      });
    }

    if (user.status === "active" || user.status === "pending") {
      return res.status(400).json({
        success: false,
        message: `NIC already uploaded! Status: ${user.status}`,
      });
    }

    user.nic = {
      frontImage,
      backImage,
    };
    user.status = "pending";
    await user.save();

    return res.status(201).json({
      success: false,
      message: "NIC uploaded successfully!",
      nicStatus: user.status,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Sever Error: ${err.message}`,
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

    console.log(id)
    console.log(status)
    if (!id) {
      return res.status(400).json({
        success: false,
        message:
          "User id not sent",
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
