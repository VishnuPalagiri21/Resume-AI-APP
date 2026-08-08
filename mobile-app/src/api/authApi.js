import API from './axios';

export const authApi = {
  login: async (email, password, expectedRole) => {
    const { data } = await API.post('/api/auth/login', { email, password, expectedRole });
    return data;
  },
  signup: async (payload) => {
    const { data } = await API.post('/api/auth/signup', payload);
    return data;
  },
  forgotPassword: async (email, role) => {
    const { data } = await API.post('/api/auth/forgot-password', { email, role });
    return data;
  },
  verifyResetOtp: async (email, otp) => {
    const { data } = await API.post('/api/auth/verify-reset-otp', { email, otp });
    return data;
  },
  resetPassword: async (email, resetToken, newPassword) => {
    const { data } = await API.post('/api/auth/reset-password', { email, resetToken, newPassword });
    return data;
  },
  logout: async () => {
    try {
      await API.post('/api/auth/logout');
    } catch (e) {
      // ignore
    }
  },
};
