import API from './axios';

export const editorApi = {
  getTemplates: async () => {
    const { data } = await API.get('/api/editor/templates');
    return data;
  },
  getDocuments: async () => {
    const { data } = await API.get('/api/editor/documents');
    return data;
  },
  createDocument: async (title, template) => {
    const { data } = await API.post('/api/editor/documents', { title, template });
    return data;
  },
  generateAiDocument: async (resumeText, jobDescription, title) => {
    const { data } = await API.post('/api/editor/generate', { resumeText, jobDescription, title });
    return data;
  },
  getDocumentById: async (docId) => {
    const { data } = await API.get(`/api/editor/documents/${docId}`);
    return data;
  },
  updateDocument: async (docId, payload) => {
    const { data } = await API.put(`/api/editor/documents/${docId}`, payload);
    return data;
  },
  deleteDocument: async (docId) => {
    const { data } = await API.delete(`/api/editor/documents/${docId}`);
    return data;
  },
  compileDocument: async (docId, latexSource) => {
    const { data } = await API.post(`/api/editor/documents/${docId}/compile`, { latexSource });
    return data;
  },
  saveVersion: async (docId, label) => {
    const { data } = await API.post(`/api/editor/documents/${docId}/versions`, { label });
    return data;
  },
  getVersions: async (docId) => {
    const { data } = await API.get(`/api/editor/documents/${docId}/versions`);
    return data;
  },
  toggleShare: async (docId, isPublic) => {
    const { data } = await API.put(`/api/editor/documents/${docId}/share`, { isPublic });
    return data;
  },
};
