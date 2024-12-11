import { loginWithEmail } from '../utils/emailLogin';

// In your component:
const handleEmailLogin = async (email) => {
  try {
    const response = await loginWithEmail(email);
    // Handle successful login
    console.log('Login successful:', response);
  } catch (error) {
    // Handle error
    console.error('Login failed:', error);
  }
};