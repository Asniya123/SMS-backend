import jwt from 'jsonwebtoken';

const generateAccessToken = (userId: string, role: string = 'admin') => {  
  return jwt.sign({ id: userId, role }, 'your-super-secret-jwt-key-here-make-it-long-and-random', { expiresIn: '1h' });
};

const generateRefreshToken = (userId: string) => { 
  return jwt.sign({ id: userId }, 'your-super-secret-jwt-key-here-make-it-long-and-random', { expiresIn: '7d' });
};

export { generateAccessToken, generateRefreshToken };
