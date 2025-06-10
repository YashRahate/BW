// middleware/verifyVolunteerToken.js
const jwt = require('jsonwebtoken');

const verifyVolunteerToken = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
if (decoded.role !== 'volunteer') {
  return res.status(403).json({ message: 'Access denied. Not a volunteer.' });
}

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.volunteerId = decoded.id; // assuming payload = { id, role }
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = verifyVolunteerToken;
