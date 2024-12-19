import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const authenticateUser = (req:any, res:any, next:any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decodedToken = jwt.verify(token, process.env.KEYCLOAK_PUBLIC_KEY!, { algorithms: ['RS256'] });
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('JWT Authentication Error:', error);
    res.status(401).json({ message: 'Unauthorized' });
  }
};
