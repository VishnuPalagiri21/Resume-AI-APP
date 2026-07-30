import API from './axios';

export const recruiterApi = {
  getStats: async () => {
    const { data } = await API.get('/api/recruiter/stats');
    return data;
  },
  getJobs: async () => {
    const { data } = await API.get('/api/recruiter/jobs');
    return data;
  },
  createJob: async (jobData) => {
    const { data } = await API.post('/api/recruiter/jobs', jobData);
    return data;
  },
  updateJob: async (jobId, jobData) => {
    const { data } = await API.put(`/api/recruiter/jobs/${jobId}`, jobData);
    return data;
  },
  deleteJob: async (jobId) => {
    const { data } = await API.delete(`/api/recruiter/jobs/${jobId}`);
    return data;
  },
  getApplicantsForJob: async (jobId) => {
    const { data } = await API.get(`/api/recruiter/jobs/${jobId}/applicants`);
    return data;
  },
  getShortlistedCandidates: async () => {
    const { data } = await API.get('/api/recruiter/shortlisted');
    return data;
  },
  updateApplicantStatus: async (applicationId, status, rejectionReason) => {
    const { data } = await API.put(`/api/recruiter/applicants/${applicationId}/status`, {
      status,
      rejectionReason,
    });
    return data;
  },
};
