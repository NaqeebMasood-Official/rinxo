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

    if (user.status === "active") {
      return res.status(400).json({
        success: false,
        message: "NIC already uploaded!",
      });
    }

    user.nic = {
      frontImage,
      backImage,
    };
    user.status = "active";
    await user.save();

    return res.status(201).json({
      success: false,
      message: "NIC uploaded successfully!",
      nicStatus: user.status,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "NIC upload failed!",
    });
  }
};
