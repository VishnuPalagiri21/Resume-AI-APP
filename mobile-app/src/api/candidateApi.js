import API from './axios';

export const candidateApi = {
  getStats: async () => {
    const { data } = await API.get('/api/user/stats');
    return data;
  },
  getJobs: async (search = '', skill = '') => {
    const params = {};
    if (search) params.search = search;
    if (skill) params.skill = skill;
    const { data } = await API.get('/api/user/jobs', { params });
    return data;
  },
  getJobById: async (jobId) => {
    const { data } = await API.get(`/api/user/jobs/${jobId}`);
    return data;
  },
  applyForJob: async (jobId, formData) => {
    const { data } = await API.post(`/api/user/jobs/${jobId}/apply`, formData);
    return data;
  },
  getApplications: async () => {
    const { data } = await API.get('/api/user/applications');
    return data;
  },
  getResumes: async () => {
    const { data } = await API.get('/api/resumes/resumes');
    return data;
  },
  uploadResume: async (formData) => {
    const { data } = await API.post('/api/resumes/resumes', formData);
    return data;
  },
  scoreAtsText: async (fileName, extractedText, jobDescription) => {
    const { data } = await API.post('/api/ats/score', { fileName, extractedText, jobDescription });
    return data;
  },
  getSuggestions: async (missingSkills) => {
    const { data } = await API.post('/api/suggestion/generate', { missingSkills });
    return data;
  },
  getDashboardResumes: async () => {
    const { data } = await API.get('/api/dashboard/resumes');
    return data;
  },
};
