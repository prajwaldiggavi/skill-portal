import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

interface SettingsScreenProps {
  onBack: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
  const { user, logout, baseUrl, updateBaseUrl } = useAuth();
  const [serverUrl, setServerUrl] = useState(baseUrl);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveUrl = async () => {
    if (!serverUrl.trim()) return;
    try {
      await updateBaseUrl(serverUrl.trim());
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch {
      Alert.alert('Error', 'Failed to save server URL.');
    }
  };

  const handleLogoutConfirm = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to log out of the Admin QR Scanner app?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: () => logout() },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Ionicons name="arrow-back" size={22} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scanner Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Admin Profile Card */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionLabel}>ADMINISTRATOR IDENTITY</Text>
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.fullName?.charAt(0) || 'A'}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.fullName || 'Academic Officer'}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
            <View style={styles.roleBadge}>
              <Ionicons name="shield-checkmark" size={12} color="#00c2ff" />
              <Text style={styles.roleText}>{user?.role || 'ROLE_ADMIN'}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Server Endpoint Configuration */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionLabel}>BACKEND ENDPOINT URL</Text>
        <Text style={styles.sectionDesc}>
          Set the Spring Boot API base address (e.g. Render public URL or local IP address for physical phone testing).
        </Text>

        <TextInput
          style={styles.urlInput}
          value={serverUrl}
          onChangeText={setServerUrl}
          placeholder="http://10.0.2.2:8080/api/v1"
          placeholderTextColor="#475569"
          autoCapitalize="none"
        />

        {savedSuccess && (
          <View style={styles.savedBanner}>
            <Ionicons name="checkmark-circle" size={14} color="#10b981" />
            <Text style={styles.savedText}>Endpoint updated and persisted!</Text>
          </View>
        )}

        <TouchableOpacity style={styles.saveBtn} onPress={handleSaveUrl} activeOpacity={0.8}>
          <Text style={styles.saveBtnText}>Save Endpoint Configuration</Text>
        </TouchableOpacity>
      </View>

      {/* Security & Verification Info */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionLabel}>SECURITY & DUPLICATE PROTECTION</Text>
        <View style={styles.infoRow}>
          <Ionicons name="finger-print" size={18} color="#00c2ff" />
          <Text style={styles.infoText}>Unique cryptographically random QR token per student</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="ban" size={18} color="#f59e0b" />
          <Text style={styles.infoText}>Same-day duplicate check-in rejection enforced</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="cloud-done" size={18} color="#10b981" />
          <Text style={styles.infoText}>Instant sync with MySQL attendance registers</Text>
        </View>
      </View>

      {/* Sign Out Button */}
      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={handleLogoutConfirm}
        activeOpacity={0.85}
      >
        <Ionicons name="log-out-outline" size={20} color="#f43f5e" />
        <Text style={styles.logoutBtnText}>Sign Out from Scanner</Text>
      </TouchableOpacity>
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
    paddingTop: 50,
    paddingBottom: 40,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
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
  },
  sectionCard: {
    backgroundColor: '#111520',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1f2738',
    padding: 18,
    gap: 10,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  sectionDesc: {
    fontSize: 11,
    color: '#94a3b8',
    lineHeight: 16,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 4,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#00b4d8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#090d14',
  },
  profileInfo: {
    flex: 1,
    gap: 2,
  },
  profileName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  profileEmail: {
    fontSize: 12,
    color: '#94a3b8',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,194,255,0.1)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  roleText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#00c2ff',
  },
  urlInput: {
    backgroundColor: '#0a0d14',
    borderWidth: 1,
    borderColor: '#1e2638',
    borderRadius: 12,
    color: '#ffffff',
    fontSize: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: 'monospace',
  },
  savedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  savedText: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: 'bold',
  },
  saveBtn: {
    backgroundColor: '#1f2738',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 2,
  },
  saveBtnText: {
    color: '#00c2ff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  infoText: {
    color: '#cbd5e1',
    fontSize: 12,
    flex: 1,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(244,63,94,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(244,63,94,0.3)',
    paddingVertical: 14,
    borderRadius: 18,
    marginTop: 10,
  },
  logoutBtnText: {
    color: '#f43f5e',
    fontSize: 13,
    fontWeight: 'bold',
  },
});
