export const requireAdmin = (req, res, next) => {
  const adminKey = req.headers["x-admin-key"];

  if (adminKey !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  }

  next(); // admin allowed
};
