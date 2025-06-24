import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { pollsAPI } from '../api/polls';

interface PollOption {
  option_id: number;
  option_text: string;
  response_count: number;
}

interface Poll {
  poll_id: number;
  title: string;
  description: string;
  category: string;
  expires_at: string;
  Options: PollOption[];
  user_response?: {
    option_id: number;
    option_text: string;
  };
}

const PollDetailScreen = ({ route, navigation }) => {
  const { pollId } = route.params;
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    fetchPoll();
  }, [pollId]);

  const fetchPoll = async () => {
    try {
      const response = await pollsAPI.getPoll(pollId);
      setPoll(response.data);
      
      // 이미 투표했는지 확인
      if (response.data.user_response) {
        setHasVoted(true);
        setSelectedOption(response.data.user_response.option_id);
      }
    } catch (error) {
      Alert.alert('오류', '여론조사를 불러올 수 없습니다.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async () => {
    if (!selectedOption) {
      Alert.alert('알림', '옵션을 선택해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      await pollsAPI.submitResponse(pollId.toString(), selectedOption);
      setHasVoted(true);
      Alert.alert('성공', '투표가 완료되었습니다!');
      // 투표 후 데이터 다시 불러오기
      await fetchPoll();
    } catch (error) {
      Alert.alert('오류', error.response?.data?.message || '투표에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3897f0" />
        <Text style={styles.loadingText}>여론조사를 불러오는 중...</Text>
      </View>
    );
  }

  if (!poll) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>여론조사를 찾을 수 없습니다.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>뒤로 가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const totalVotes = poll.Options?.reduce((sum, option) => sum + (option.response_count || 0), 0) || 0;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>여론조사</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{poll.title}</Text>
        <Text style={styles.category}>{poll.category}</Text>
        <Text style={styles.description}>{poll.description}</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoText}>
            마감일: {poll.expires_at ? poll.expires_at.split('T')[0] : '미정'}
          </Text>
          <Text style={styles.infoText}>총 {totalVotes}명 참여</Text>
        </View>

        <View style={styles.optionsContainer}>
          <Text style={styles.optionsTitle}>투표 옵션</Text>
          {poll.Options?.map((option) => {
            const percentage = totalVotes > 0 ? Math.round((option.response_count / totalVotes) * 100) : 0;
            const isSelected = selectedOption === option.option_id;
            const isVoted = hasVoted && isSelected;

            return (
              <TouchableOpacity
                key={option.option_id}
                style={[
                  styles.optionCard,
                  isSelected && styles.optionCardSelected,
                  isVoted && styles.optionCardVoted,
                ]}
                onPress={() => !hasVoted && setSelectedOption(option.option_id)}
                disabled={hasVoted}
              >
                <View style={styles.optionHeader}>
                  <Text style={styles.optionText}>{option.option_text}</Text>
                  {hasVoted && (
                    <Text style={styles.optionPercentage}>
                      {percentage}% ({option.response_count}표)
                    </Text>
                  )}
                </View>
                
                {hasVoted && (
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${percentage}%` },
                      ]}
                    />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {!hasVoted && (
          <TouchableOpacity
            style={[
              styles.voteButton,
              !selectedOption && styles.voteButtonDisabled,
            ]}
            onPress={handleVote}
            disabled={submitting || !selectedOption}
          >
            <Text style={styles.voteButtonText}>
              {submitting ? '투표 중...' : '투표하기'}
            </Text>
          </TouchableOpacity>
        )}

        {hasVoted && (
          <View style={styles.votedMessage}>
            <Text style={styles.votedMessageText}>투표가 완료되었습니다! 감사합니다.</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    fontSize: 16,
    color: '#ff4757',
    textAlign: 'center',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#3897f0',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 50,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  category: {
    fontSize: 16,
    color: '#3897f0',
    fontWeight: '600',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  infoText: {
    fontSize: 14,
    color: '#999',
  },
  optionsContainer: {
    marginBottom: 24,
  },
  optionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  optionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  optionCardSelected: {
    borderColor: '#3897f0',
    borderWidth: 2,
  },
  optionCardVoted: {
    backgroundColor: '#e3f0fc',
    borderColor: '#3897f0',
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  optionPercentage: {
    fontSize: 14,
    color: '#3897f0',
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3897f0',
  },
  voteButton: {
    backgroundColor: '#3897f0',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  voteButtonDisabled: {
    backgroundColor: '#ccc',
  },
  voteButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  votedMessage: {
    backgroundColor: '#e3f0fc',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  votedMessageText: {
    color: '#3897f0',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PollDetailScreen; 