import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../api/client';
import { AttendanceSessionItem } from '../types';

interface HistoryScreenProps {
  onBack: () => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ onBack }) => {
  const [sessions, setSessions] = useState<AttendanceSessionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSessions = async () => {
    try {
      const res = await api.get('/admin/attendance/sessions');
      setSessions(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load past sessions', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSessions();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Ionicons name="arrow-back" size={22} color="#ffffff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Session History</Text>
          <Text style={styles.headerSub}>{sessions.length} Batches Conducted</Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
          <Ionicons name="refresh" size={20} color="#00c2ff" />
        </TouchableOpacity>
      </View>

      {/* Sessions List */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#00c2ff" size="large" />
          <Text style={styles.loadingText}>Loading past attendance sessions...</Text>
        </View>
      ) : sessions.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="calendar-outline" size={48} color="#334155" />
          <Text style={styles.emptyTitle}>No sessions recorded</Text>
          <Text style={styles.emptySub}>
            Past lecture sessions will appear here after attendance registers are opened.
          </Text>
        </View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00c2ff" />}
          renderItem={({ item }) => (
            <View style={styles.sessionCard}>
              <View style={styles.cardHeader}>
                <View style={styles.badgeGroup}>
                  <View style={styles.batchBadge}>
                    <Text style={styles.batchBadgeText}>{item.batchName}</Text>
                  </View>
                  <Text style={styles.dateText}>{item.sessionDate}</Text>
                </View>
                <Text style={styles.timeText}>{item.startTime} - {item.endTime}</Text>
              </View>

              <Text style={styles.topicTitle}>{item.topic}</Text>

              <View style={styles.metricsRow}>
                <View style={[styles.statPill, { backgroundColor: 'rgba(16,185,129,0.1)' }]}>
                  <Text style={[styles.statValue, { color: '#10b981' }]}>{item.presentCount}</Text>
                  <Text style={[styles.statLabel, { color: '#10b981' }]}>Present</Text>
                </View>
                <View style={[styles.statPill, { backgroundColor: 'rgba(244,63,94,0.1)' }]}>
                  <Text style={[styles.statValue, { color: '#f43f5e' }]}>{item.absentCount}</Text>
                  <Text style={[styles.statLabel, { color: '#f43f5e' }]}>Absent</Text>
                </View>
                {item.lateCount > 0 ? (
                  <View style={[styles.statPill, { backgroundColor: 'rgba(245,158,11,0.1)' }]}>
                    <Text style={[styles.statValue, { color: '#f59e0b' }]}>{item.lateCount}</Text>
                    <Text style={[styles.statLabel, { color: '#f59e0b' }]}>Late</Text>
                  </View>
                ) : null}
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c0e12',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a2233',
  },
  backBtn: {
    padding: 8,
    backgroundColor: '#141720',
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center',
  },
  headerSub: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 2,
  },
  refreshBtn: {
    padding: 8,
    backgroundColor: 'rgba(0,194,255,0.1)',
    borderRadius: 12,
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
    gap: 12,
  },
  sessionCard: {
    backgroundColor: '#111520',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1f2738',
    padding: 16,
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  batchBadge: {
    backgroundColor: 'rgba(0,194,255,0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  batchBadgeText: {
    color: '#00c2ff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  dateText: {
    color: '#94a3b8',
    fontSize: 11,
    fontFamily: 'monospace',
  },
  timeText: {
    color: '#64748b',
    fontSize: 11,
    fontFamily: 'monospace',
  },
  topicTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statValue: {
    fontSize: 12,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    gap: 10,
  },
  loadingText: {
    color: '#64748b',
    fontSize: 12,
  },
  emptyTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  emptySub: {
    color: '#64748b',
    fontSize: 12,
    textAlign: 'center',
  },
});
