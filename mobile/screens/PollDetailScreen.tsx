import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, TextInput, ActivityIndicator } from 'react-native';
import { pollsAPI } from '../api/polls';

const PollDetailScreen = ({ route }) => {
  const { pollId } = route.params;
  const [poll, setPoll] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [voted, setVoted] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    pollsAPI.getPoll(pollId.toString()).then(res => {
      const pollData = res.data;
      setPoll(pollData);
      setResults(pollData.Options || []);
      setComments(pollData.comments || []);
      setVoted(!!pollData.user_response);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [pollId]);

  const handleVote = async () => {
    if (!selectedOption) return;
    try {
      await pollsAPI.votePoll(pollId.toString(), selectedOption);
      setVoted(true);
      // 최신 데이터 다시 불러오기
      const res = await pollsAPI.getPoll(pollId.toString());
      const pollData = res.data;
      setPoll(pollData);
      setResults(pollData.Options || []);
      setComments(pollData.comments || []);
      setVoted(!!pollData.user_response);
      // 디버깅용 로그 추가
      console.log('투표 후 poll.Options:', pollData.Options);
      const totalVotes = (pollData.Options || []).reduce((sum, opt) => sum + Number(opt.response_count || 0), 0);
      console.log('투표 후 totalVotes:', totalVotes);
    } catch (e) {
      alert('투표 실패');
    }
  };

  const handleComment = async () => {
    if (!comment.trim()) return;
    try {
      await pollsAPI.addComment(pollId.toString(), comment);
      setComment('');
      // 최신 데이터 다시 불러오기
      const res = await pollsAPI.getPoll(pollId.toString());
      setComments(res.data.comments || []);
    } catch (e) {
      alert('댓글 등록 실패');
    }
  };

  const handleReply = (commentId) => {
    if (!replyText.trim()) return;
    setComments(comments.map(c =>
      c.id === commentId
        ? { ...c, replies: [...(c.replies || []), { id: Date.now(), text: replyText }] }
        : c
    ));
    setReplyTo(null);
    setReplyText('');
  };

  if (loading || !poll) {
    return <ActivityIndicator size="large" color="#3897f0" style={{ flex: 1, justifyContent: 'center' }} />;
  }

  // 투표 결과 비율 계산
  const totalVotes = results.reduce((sum, opt) => sum + Number(opt.response_count || 0), 0);

  return (
    <View style={styles.container}>
      {/* 질문 */}
      <Text style={styles.title}>{poll.title}</Text>
      <Text style={styles.desc}>{poll.description}</Text>
      {/* 옵션/투표 */}
      {!voted ? (
        <View style={styles.optionsWrap}>
          {results.map(opt => (
            <TouchableOpacity
              key={opt.option_id}
              style={[styles.optionBtn, selectedOption === opt.option_id && styles.optionBtnSelected]}
              onPress={() => setSelectedOption(opt.option_id)}
            >
              <Text style={{ color: selectedOption === opt.option_id ? '#fff' : '#3897f0' }}>{opt.option_text}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.voteBtn} onPress={handleVote}>
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>투표하기</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.resultsWrap}>
          {results.map(opt => {
            const percent = totalVotes ? Math.round(Number(opt.response_count || 0) / totalVotes * 100) : 0;
            return (
              <View key={opt.option_id} style={styles.resultBarWrap}>
                <Text style={styles.resultText}>{opt.option_text}</Text>
                <View style={styles.resultBarBg}>
                  <View style={[styles.resultBar, { width: `${percent}%` }]} />
                </View>
                <Text style={styles.resultPercent}>{percent}%</Text>
              </View>
            );
          })}
        </View>
      )}
      {/* 댓글/대댓글 */}
      <Text style={styles.sectionTitle}>토론</Text>
      <FlatList
        data={comments}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.commentWrap}>
            <Text style={styles.commentText}>{item.text}</Text>
            <TouchableOpacity onPress={() => setReplyTo(item.id)}>
              <Text style={styles.replyBtn}>답글</Text>
            </TouchableOpacity>
            {/* 대댓글 */}
            {item.replies && item.replies.map(reply => (
              <View key={reply.id} style={styles.replyWrap}>
                <Text style={styles.replyText}>{reply.text}</Text>
              </View>
            ))}
            {/* 대댓글 입력 */}
            {replyTo === item.id && (
              <View style={styles.replyInputWrap}>
                <TextInput
                  style={styles.replyInput}
                  value={replyText}
                  onChangeText={setReplyText}
                  placeholder="답글 입력"
                />
                <TouchableOpacity onPress={() => handleReply(item.id)}>
                  <Text style={styles.replySendBtn}>등록</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#aaa', margin: 24 }}>아직 댓글이 없습니다.</Text>}
        style={{ marginTop: 16 }}
      />
      {/* 댓글 입력 */}
      <View style={styles.commentInputWrap}>
        <TextInput
          style={styles.commentInput}
          value={comment}
          onChangeText={setComment}
          placeholder="댓글을 입력하세요"
        />
        <TouchableOpacity onPress={handleComment}>
          <Text style={styles.commentSendBtn}>등록</Text>
        </TouchableOpacity>
      </View>
      {/* 디버깅용: poll.Options와 totalVotes 화면 표시 */}
      <Text style={{ fontSize: 12, color: '#888', marginTop: 8 }}>
        poll.Options: {JSON.stringify(results)}
      </Text>
      <Text style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>
        총 투표수: {totalVotes}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  desc: { color: '#555', marginBottom: 16 },
  optionsWrap: { marginBottom: 24 },
  optionBtn: { borderWidth: 1, borderColor: '#3897f0', borderRadius: 16, padding: 12, marginBottom: 8, alignItems: 'center', backgroundColor: '#fff' },
  optionBtnSelected: { backgroundColor: '#3897f0' },
  voteBtn: { backgroundColor: '#3897f0', borderRadius: 16, padding: 14, alignItems: 'center', marginTop: 8 },
  resultsWrap: { marginBottom: 24 },
  resultBarWrap: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  resultText: { flex: 1 },
  resultBarBg: { flex: 3, height: 16, backgroundColor: '#eaf4ff', borderRadius: 8, marginHorizontal: 8 },
  resultBar: { height: 16, backgroundColor: '#3897f0', borderRadius: 8 },
  resultPercent: { width: 40, textAlign: 'right' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
  commentWrap: { backgroundColor: '#f7faff', borderRadius: 8, padding: 12, marginBottom: 8 },
  commentText: { fontSize: 15 },
  replyBtn: { color: '#3897f0', marginTop: 4 },
  replyWrap: { backgroundColor: '#eaf4ff', borderRadius: 8, padding: 8, marginTop: 6, marginLeft: 16 },
  replyText: { color: '#333' },
  replyInputWrap: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  replyInput: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 6, marginRight: 8 },
  replySendBtn: { color: '#3897f0', fontWeight: 'bold' },
  commentInputWrap: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  commentInput: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginRight: 8 },
  commentSendBtn: { color: '#3897f0', fontWeight: 'bold' },
});

export default PollDetailScreen; 