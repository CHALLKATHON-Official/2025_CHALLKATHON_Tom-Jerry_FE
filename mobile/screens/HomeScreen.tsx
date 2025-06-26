import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Image,
} from 'react-native';
import { pollsAPI } from '../api/polls';
import { fetchNaverNews } from '../api/news';
import { useFocusEffect } from '@react-navigation/native';

interface Poll {
  poll_id: number;
  title: string;
  description: string;
  category: string;
  expires_at: string;
  Options: Array<{
    option_id: number;
    option_text: string;
    response_count: number;
  }>;
  participant_count?: number;
}

const HomeScreen = ({ navigation }) => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [news, setNews] = useState([]);
  const [loadingNews, setLoadingNews] = useState(true);

  const fetchPolls = async () => {
    try {
      const response = await pollsAPI.getPolls();
      console.log('pollsAPI.getPolls 응답:', response.data.polls);
      if (response.data.polls) {
        setPolls(response.data.polls);
      } else if (Array.isArray(response.data)) {
        setPolls(response.data);
      } else {
        setPolls([]);
      }
      setError('');
    } catch (err) {
      setError('여론조사를 불러올 수 없습니다.');
      console.error('Error fetching polls:', err);
    }
  };

  useEffect(() => {
    fetchPolls().finally(() => setLoading(false));
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchPolls();
    }, [])
  );

  useEffect(() => {
    fetchNaverNews()
      .then(setNews)
      .catch(() => alert('뉴스를 불러오지 못했습니다.'))
      .finally(() => setLoadingNews(false));
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPolls();
    setRefreshing(false);
  };

  const renderPollItem = ({ item, index }: { item: Poll, index: number }) => {
    const totalVotes = typeof item.participant_count === 'number' ? item.participant_count : (item.Options?.reduce((sum, option) => sum + Number(option.response_count || 0), 0) || 0);
    const bgColor = index % 2 === 0 ? '#eaf4ff' : '#fff';
    return (
      <TouchableOpacity
        style={[styles.pollCard, { backgroundColor: bgColor }]}
        onPress={() => navigation.navigate('PollDetail', { pollId: item.poll_id })}
      >
        <Text style={styles.pollTitle}>{item.title}</Text>
        <View style={styles.categoryBadge}><Text style={styles.pollCategory}>{item.category}</Text></View>
        <Text style={styles.pollDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.pollFooter}>
          <Text style={styles.pollDate}>
            마감: {item.expires_at ? item.expires_at.split('T')[0] : '미정'}
          </Text>
          <Text style={styles.pollVotes}>총 참여수: {totalVotes}명</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3897f0" />
        <Text style={styles.loadingText}>여론조사를 불러오는 중...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>실시간 인기 여론조사</Text>
      
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchPolls}>
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={polls}
          renderItem={renderPollItem}
          keyExtractor={(item) => item.poll_id.toString()}
          extraData={polls}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>진행 중인 여론조사가 없습니다.</Text>
            </View>
          }
        />
      )}
      <Text style={{ fontSize: 20, fontWeight: 'bold', margin: 12 }}>실시간 뉴스</Text>
      {loadingNews ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={news}
          keyExtractor={item => item.link}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => { /* 웹뷰 등으로 기사 열기 */ }}>
              <View style={{ flexDirection: 'row', margin: 8 }}>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={{ fontWeight: 'bold' }}>{item.title.replace(/<[^>]+>/g, '')}</Text>
                  <Text numberOfLines={2}>{item.description.replace(/<[^>]+>/g, '')}</Text>
                  <Text style={{ color: '#888', fontSize: 12 }}>{item.pubDate}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
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
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ff4757',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#3897f0',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
  },
  pollCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#dbeafe',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 2,
    marginBottom: 8,
    marginTop: -4,
  },
  pollTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  pollCategory: {
    fontSize: 13,
    color: '#2563eb',
    fontWeight: 'bold',
    marginBottom: 0,
  },
  pollDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  pollFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  pollDate: {
    fontSize: 12,
    color: '#999',
  },
  pollVotes: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: 'bold',
    textAlign: 'right',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});

export default HomeScreen; 