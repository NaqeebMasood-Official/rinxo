export const getDashboardStats = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Dashboard route is working fine",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error, dashboard route not working!",
    });
  }
};
