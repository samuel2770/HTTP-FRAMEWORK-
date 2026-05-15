const { auth } = require('../config/firebase');

const verifyToken = async (req, res, next) => {
  const idToken = req.headers.authorization?.split('Bearer ')[1];

  if (!idToken) {
    return res.status(401).json({ success: false, error: 'Unauthorized: No token provided' });
  }

  try {
    if (!auth) {
      // For development purposes when Firebase is not configured
      req.user = { uid: 'dev-user-id', email: 'dev@example.com' };
      return next();
    }
    const decodedToken = await auth.verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({ success: false, error: 'Unauthorized: Invalid token' });
  }
};

module.exports = { verifyToken };
