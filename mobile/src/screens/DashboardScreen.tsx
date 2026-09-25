import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { TodayScanItem } from '../types';

interface DashboardScreenProps {
  onNavigate: (screen: string) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [scans, setScans] = useState<TodayScanItem[]>([]);
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

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00c2ff" />}
    >
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Administrator Portal</Text>
          <Text style={styles.adminName}>{user?.fullName || 'Academic Officer'}</Text>
        </View>
        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => onNavigate('settings')}
          activeOpacity={0.8}
        >
          <Ionicons name="settings-sharp" size={20} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      {/* Hero Scanner Launch Card */}
      <View style={styles.heroCard}>
        <View style={styles.heroContent}>
          <View style={styles.badgeRow}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>SYSTEM ONLINE</Text>
          </View>
          <Text style={styles.heroTitle}>QR Attendance Scanner</Text>
          <Text style={styles.heroDesc}>
            Verify student attendance instantaneously with encrypted identity token scanning.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.launchBtn}
          onPress={() => onNavigate('scanner')}
          activeOpacity={0.85}
        >
          <Ionicons name="scan" size={22} color="#090d14" />
          <Text style={styles.launchBtnText}>Launch Camera Scanner</Text>
        </TouchableOpacity>
      </View>

      {/* Metrics Row */}
      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>TODAY'S SCANS</Text>
            <Ionicons name="people" size={16} color="#10b981" />
          </View>
          <Text style={[styles.metricValue, { color: '#10b981' }]}>{scans.length}</Text>
          <Text style={styles.metricSub}>Students Verified</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>VERIFICATION</Text>
            <Ionicons name="shield-checkmark" size={16} color="#00c2ff" />
          </View>
          <Text style={[styles.metricValue, { color: '#00c2ff' }]}>100%</Text>
          <Text style={styles.metricSub}>Anti-Proxy Enforced</Text>
        </View>
      </View>

      {/* Navigation Quick Grid */}
      <View style={styles.navGrid}>
        <TouchableOpacity
          style={styles.navTile}
          onPress={() => onNavigate('today')}
          activeOpacity={0.8}
        >
          <View style={[styles.navIconBox, { backgroundColor: 'rgba(0,194,255,0.1)' }]}>
            <Ionicons name="calendar-outline" size={20} color="#00c2ff" />
          </View>
          <Text style={styles.navTileTitle}>Today's Roster</Text>
          <Text style={styles.navTileSub}>{scans.length} Check-ins</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navTile}
          onPress={() => onNavigate('history')}
          activeOpacity={0.8}
        >
          <View style={[styles.navIconBox, { backgroundColor: 'rgba(168,85,247,0.1)' }]}>
            <Ionicons name="time-outline" size={20} color="#c084fc" />
          </View>
          <Text style={styles.navTileTitle}>Past Sessions</Text>
          <Text style={styles.navTileSub}>Archive Logs</Text>
        </TouchableOpacity>
      </View>

      {/* Live Recent Scans Feed */}
      <View style={styles.feedCard}>
        <View style={styles.feedHeader}>
          <View style={styles.feedTitleRow}>
            <Ionicons name="pulse" size={16} color="#00c2ff" />
            <Text style={styles.feedTitle}>Live Check-In Feed</Text>
          </View>
          <TouchableOpacity onPress={() => onNavigate('today')}>
            <Text style={styles.feedViewAll}>View All</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color="#00c2ff" style={{ marginVertical: 20 }} />
        ) : scans.length === 0 ? (
          <View style={styles.emptyFeed}>
            <Ionicons name="scan-circle-outline" size={36} color="#334155" />
            <Text style={styles.emptyFeedText}>No scans recorded today yet.</Text>
          </View>
        ) : (
          <View style={styles.feedList}>
            {scans.slice(0, 4).map((scan) => (
              <View key={scan.recordId} style={styles.feedItem}>
                <View style={styles.feedItemLeft}>
                  <View style={styles.feedAvatar}>
                    <Text style={styles.feedAvatarText}>
                      {scan.studentName?.charAt(0) || 'S'}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.feedStudentName}>{scan.studentName}</Text>
                    <Text style={styles.feedStudentId}>
                      {scan.studentIdNumber} • {scan.batchName}
                    </Text>
                  </View>
                </View>

                <View style={styles.feedItemRight}>
                  <Text style={styles.feedTime}>{scan.scanTime}</Text>
                  <View style={styles.feedStatusBadge}>
                    <Text style={styles.feedStatusText}>PRESENT</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c0e12',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 10,
  },
  greeting: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  adminName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
    marginTop: 2,
  },
  settingsBtn: {
    padding: 10,
    backgroundColor: '#141720',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e2434',
  },
  heroCard: {
    backgroundColor: '#111520',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#1f2738',
    padding: 22,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  heroContent: {
    marginBottom: 18,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  liveText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#10b981',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
  },
  heroDesc: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
    lineHeight: 18,
  },
  launchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#00b4d8',
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: '#00c2ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  launchBtnText: {
    color: '#090d14',
    fontSize: 13,
    fontWeight: '900',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#111520',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1f2738',
    padding: 16,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '900',
  },
  metricSub: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  navGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  navTile: {
    flex: 1,
    backgroundColor: '#111520',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1f2738',
    padding: 16,
    alignItems: 'center',
  },
  navIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  navTileTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  navTileSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  feedCard: {
    backgroundColor: '#111520',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#1f2738',
    padding: 20,
  },
  feedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  feedTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  feedTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#ffffff',
  },
  feedViewAll: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#00c2ff',
  },
  emptyFeed: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  emptyFeedText: {
    color: '#64748b',
    fontSize: 12,
  },
  feedList: {
    gap: 12,
  },
  feedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#171d2b',
  },
  feedItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  feedAvatar: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#1a2232',
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedAvatarText: {
    color: '#00c2ff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  feedStudentName: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  feedStudentId: {
    color: '#64748b',
    fontSize: 11,
    fontFamily: 'monospace',
    marginTop: 1,
  },
  feedItemRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  feedTime: {
    color: '#94a3b8',
    fontSize: 11,
    fontFamily: 'monospace',
  },
  feedStatusBadge: {
    backgroundColor: 'rgba(16,185,129,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  feedStatusText: {
    color: '#10b981',
    fontSize: 9,
    fontWeight: 'bold',
  },
});
