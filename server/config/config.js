const config = {
  port: process.env.PORT || 5000,
  dbURI: process.env.MONGO_URI || 'mongodb+srv://root:root@selfie-mern.vukiuom.mongodb.net/?retryWrites=true&w=majority&appName=selfie-MERN',
  jwtSecret: process.env.JWT_SECRET || 'your_secret_key', 
  mailtrapUser: process.env.MAILTRAP_USER || '0a956a06d65cea', 
  mailtrapPass: process.env.MAILTRAP_PASS || '32ed3e43615537', 
};

export default config;
