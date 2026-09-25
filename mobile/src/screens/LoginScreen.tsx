import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

export const LoginScreen: React.FC = () => {
  const { login, baseUrl, updateBaseUrl } = useAuth();
  const [email, setEmail] = useState('admin@skillportal.com');
  const [password, setPassword] = useState('Admin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [showServerConfig, setShowServerConfig] = useState(false);
  const [serverUrlInput, setServerUrlInput] = useState(baseUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);
    if (!email.trim() || !password) {
      setError('Please provide your admin email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || 'Login failed. Please verify credentials and server URL.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveServerUrl = async () => {
    if (serverUrlInput.trim()) {
      await updateBaseUrl(serverUrlInput.trim());
      setShowServerConfig(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Brand Header */}
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoEmoji}>⚡</Text>
          </View>
          <Text style={styles.brandTitle}>TAP ACADEMY</Text>
          <Text style={styles.brandSubtitle}>Admin QR Attendance Scanner</Text>
        </View>

        {/* Login Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Administrator Sign-In</Text>
          <Text style={styles.cardDesc}>
            Authenticate with authorized staff credentials to scan student QR codes.
          </Text>

          {error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color="#fda4af" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Admin Email Address</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="mail-outline" size={18} color="#64748b" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="admin@skillportal.com"
                placeholderTextColor="#475569"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Security Password</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color="#64748b" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#475569"
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color="#64748b"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Sign In Button */}
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#090d14" />
            ) : (
              <>
                <Text style={styles.submitBtnText}>Authorize & Launch Scanner</Text>
                <Ionicons name="arrow-forward" size={18} color="#090d14" />
              </>
            )}
          </TouchableOpacity>

          {/* Server Config Toggle */}
          <TouchableOpacity
            onPress={() => setShowServerConfig(!showServerConfig)}
            style={styles.serverConfigToggle}
          >
            <Ionicons name="settings-outline" size={14} color="#64748b" />
            <Text style={styles.serverConfigToggleText}>
              {showServerConfig ? 'Hide Server URL Settings' : 'Configure Server Endpoint URL'}
            </Text>
          </TouchableOpacity>

          {showServerConfig && (
            <View style={styles.serverConfigBox}>
              <Text style={styles.serverConfigLabel}>Backend API URL</Text>
              <TextInput
                style={styles.serverInput}
                value={serverUrlInput}
                onChangeText={setServerUrlInput}
                placeholder="http://10.0.2.2:8080/api/v1"
                placeholderTextColor="#475569"
                autoCapitalize="none"
              />
              <TouchableOpacity style={styles.saveServerBtn} onPress={handleSaveServerUrl}>
                <Text style={styles.saveServerBtnText}>Update Endpoint</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c0e12',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoBadge: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#00b4d8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#00c2ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  logoEmoji: {
    fontSize: 26,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#00c2ff',
    letterSpacing: 1,
  },
  brandSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#121620',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#1f2738',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#ffffff',
  },
  cardDesc: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    marginBottom: 18,
    lineHeight: 18,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.4)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#fda4af',
    fontSize: 12,
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#94a3b8',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a0d14',
    borderWidth: 1,
    borderColor: '#1e2636',
    borderRadius: 14,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: '#ffffff',
    fontSize: 13,
    paddingVertical: 12,
  },
  eyeBtn: {
    padding: 8,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#00b4d8',
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 8,
    shadowColor: '#00c2ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnText: {
    color: '#090d14',
    fontSize: 13,
    fontWeight: '900',
  },
  serverConfigToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 18,
    paddingVertical: 6,
  },
  serverConfigToggleText: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '600',
  },
  serverConfigBox: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#0a0d14',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e2636',
    gap: 8,
  },
  serverConfigLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: 'bold',
  },
  serverInput: {
    backgroundColor: '#121620',
    borderWidth: 1,
    borderColor: '#242e42',
    borderRadius: 10,
    color: '#ffffff',
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontFamily: 'monospace',
  },
  saveServerBtn: {
    backgroundColor: '#1f2738',
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveServerBtnText: {
    color: '#00c2ff',
    fontSize: 11,
    fontWeight: 'bold',
  },
});
