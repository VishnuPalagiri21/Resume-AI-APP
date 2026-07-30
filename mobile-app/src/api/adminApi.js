import API from './axios';

export const adminApi = {
  getStats: async () => {
    const { data } = await API.get('/api/admin/stats');
    return data;
  },
  getUsers: async () => {
    const { data } = await API.get('/api/admin/users');
    return data;
  },
  deleteUser: async (userId) => {
    const { data } = await API.delete(`/api/admin/users/${userId}`);
    return data;
  },
  getRecruiters: async () => {
    const { data } = await API.get('/api/admin/recruiters');
    return data;
  },
  approveRecruiter: async (recruiterId) => {
    const { data } = await API.put(`/api/admin/recruiters/${recruiterId}/approve`);
    return data;
  },
  rejectRecruiter: async (recruiterId) => {
    const { data } = await API.put(`/api/admin/recruiters/${recruiterId}/reject`);
    return data;
  },
  getJobs: async () => {
    const { data } = await API.get('/api/admin/jobs');
    return data;
  },
};
