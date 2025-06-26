import apiClient from './config';

export const pollsAPI = {
  // 여론조사 목록 조회
  getPolls: () => {
    return apiClient.get('/polls');
  },

  // 특정 여론조사 조회
  getPoll: (pollId: string) => {
    return apiClient.get(`/polls/${pollId}`);
  },

  // 여론조사 참여
  submitResponse: (pollId: string, optionId: number) => {
    return apiClient.post(`/polls/${pollId}/responses`, {
      option_id: optionId
    });
  },

  // 여론조사 생성 (관리자용)
  createPoll: (pollData: any) => {
    let options = pollData.options;
    if (Array.isArray(options) && typeof options[0] === 'string') {
      options = options.map((opt: string) => ({ content: opt }));
    }
    return apiClient.post('/polls', { ...pollData, options });
  },

  // 여론조사 수정 (관리자용)
  updatePoll: (pollId: string, pollData: any) => {
    return apiClient.put(`/polls/${pollId}`, pollData);
  },

  // 여론조사 삭제 (관리자용)
  deletePoll: (pollId: string) => {
    return apiClient.delete(`/polls/${pollId}`);
  },

  // 투표(응답) 등록
  votePoll: (pollId: string, optionId: number) => {
    return pollsAPI.submitResponse(pollId, optionId);
  },

  // 댓글 등록
  addComment: (pollId: string, comment: string) => {
    return apiClient.post(`/polls/${pollId}/comments`, { text: comment });
  },

  // 댓글 목록 조회
  getComments: (pollId: string) => {
    return apiClient.get(`/polls/${pollId}/comments`);
  },

  // 시/도별 투표자 수 집계 API 호출
  getRegionStats: (pollId: string) => {
    return apiClient.get(`/polls/${pollId}/region-stats`);
  },

  // 성별 비율 집계 API 호출
  getGenderStats: (pollId: string) => {
    return apiClient.get(`/polls/${pollId}/results?groupBy=gender`);
  },

  // 항목별 그룹 통계(성별, 나이대, 직업 등) API 호출
  getOptionStatsByGroup: (pollId: string, groupBy: string) => {
    return apiClient.get(`/polls/${pollId}/results?groupBy=${groupBy}`);
  },

  // 인구통계 집계 API 호출
  getDemographics: (pollId: string) => {
    return apiClient.get(`/polls/${pollId}/demographics`);
  },

  // AI 분석 결과 조회
  getAIAssessment: (pollId: string) => {
    return apiClient.get(`/polls/${pollId}/ai-analysis-preview`);
  }
}; 