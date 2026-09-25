import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../api/client';
import { TodayScanItem } from '../types';

interface TodayAttendanceScreenProps {
  onBack: () => void;
}

export const TodayAttendanceScreen: React.FC<TodayAttendanceScreenProps> = ({ onBack }) => {
  const [scans, setScans] = useState<TodayScanItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchScans = async () => {
    try {
      const res = await api.get('/attendance/scans/today');
      setScans(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load today scans', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchScans();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchScans();
  };

  const filteredScans = scans.filter(
    (s) =>
      s.studentName.toLowerCase().includes(search.toLowerCase()) ||
      s.studentIdNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.batchName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Ionicons name="arrow-back" size={22} color="#ffffff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Today's Verified Scans</Text>
          <Text style={styles.headerSub}>{scans.length} Check-ins Recorded</Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
          <Ionicons name="refresh" size={20} color="#00c2ff" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={16} color="#64748b" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search by student name, roll no, or batch..."
          placeholderTextColor="#475569"
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={16} color="#64748b" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Scans List */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#00c2ff" size="large" />
          <Text style={styles.loadingText}>Fetching attendance register...</Text>
        </View>
      ) : filteredScans.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="document-text-outline" size={48} color="#334155" />
          <Text style={styles.emptyTitle}>No matching check-ins</Text>
          <Text style={styles.emptySub}>
            {search ? 'Try adjusting your search filter.' : 'Scan students using the camera scanner.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredScans}
          keyExtractor={(item) => String(item.recordId)}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00c2ff" />}
          renderItem={({ item }) => (
            <View style={styles.scanCard}>
              <View style={styles.cardLeft}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{item.studentName?.charAt(0) || 'S'}</Text>
                </View>
                <View style={styles.info}>
                  <Text style={styles.studentName}>{item.studentName}</Text>
                  <Text style={styles.studentId}>
                    {item.studentIdNumber} • <Text style={{ color: '#94a3b8' }}>{item.batchName}</Text>
                  </Text>
                  <Text style={styles.adminTag}>Verified by: {item.markedByAdminName}</Text>
                </View>
              </View>

              <View style={styles.cardRight}>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
                <Text style={styles.timeText}>{item.scanTime}</Text>
                <Text style={styles.sourceTag}>{item.source}</Text>
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121620',
    marginHorizontal: 20,
    marginVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e2638',
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 12,
    paddingVertical: 10,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 10,
  },
  scanCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#111520',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1f2738',
    padding: 14,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#1a2336',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#00c2ff',
    fontWeight: '900',
    fontSize: 16,
  },
  info: {
    flex: 1,
  },
  studentName: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  studentId: {
    color: '#00c2ff',
    fontSize: 11,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  adminTag: {
    color: '#64748b',
    fontSize: 10,
    marginTop: 2,
  },
  cardRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  statusBadge: {
    backgroundColor: 'rgba(16,185,129,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    color: '#10b981',
    fontSize: 9,
    fontWeight: '900',
  },
  timeText: {
    color: '#94a3b8',
    fontSize: 11,
    fontFamily: 'monospace',
  },
  sourceTag: {
    color: '#64748b',
    fontSize: 9,
    fontFamily: 'monospace',
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
