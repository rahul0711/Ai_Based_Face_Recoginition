


export const login = (req, res) => {
  const { email, password } = req.body;

  // ✅ ONLY ALLOWED USER
  const ALLOWED_EMAIL = "sonu@demo.com";
  const ALLOWED_PASSWORD = "Sonu15";

  if (email === ALLOWED_EMAIL && password === ALLOWED_PASSWORD) {
    return res.json({
      success: true,
      message: "Login successful"
    });
  }

  return res.status(401).json({
    success: false,
    message: "Invalid credentials"
  });
};
