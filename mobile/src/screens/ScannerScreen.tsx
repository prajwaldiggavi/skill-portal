import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import api from '../api/client';
import { QrScanResponse } from '../types';
import { ScanResultModal } from '../components/ScanResultModal';

interface ScannerScreenProps {
  onBack: () => void;
}

export const ScannerScreen: React.FC<ScannerScreenProps> = ({ onBack }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [torch, setTorch] = useState<boolean>(false);
  const [scanned, setScanned] = useState<boolean>(false);
  const [manualCode, setManualCode] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showManualInput, setShowManualInput] = useState<boolean>(false);

  // Result Modal State
  const [result, setResult] = useState<QrScanResponse | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const processingRef = useRef<boolean>(false);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  const handleProcessToken = async (token: string) => {
    if (!token || processingRef.current) return;
    processingRef.current = true;
    setScanned(true);
    setIsProcessing(true);

    try {
      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      const res = await api.post('/attendance/qr/scan', {
        qrToken: token.trim(),
        deviceInfo: Platform.OS + ' Mobile App',
      });

      const scanRes: QrScanResponse = res.data?.data;
      setResult(scanRes);
      setModalVisible(true);
    } catch (err: any) {
      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      const errMsg = err.response?.data?.message || 'Server communication failed.';
      setResult({
        attendanceStatus: 'INVALID_QR',
        message: errMsg,
      });
      setModalVisible(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (!scanned && !processingRef.current) {
      handleProcessToken(data);
    }
  };

  const handleScanNext = () => {
    setModalVisible(false);
    setResult(null);
    setScanned(false);
    processingRef.current = false;
  };

  const handleManualSubmit = () => {
    if (!manualCode.trim()) return;
    handleProcessToken(manualCode.trim());
    setManualCode('');
    setShowManualInput(false);
  };

  if (!permission) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#00c2ff" />
        <Text style={styles.centerText}>Requesting camera authorization...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="camera-reverse-outline" size={48} color="#f43f5e" />
        <Text style={styles.permissionTitle}>Camera Permission Required</Text>
        <Text style={styles.permissionDesc}>
          Camera access is required to scan student QR codes for classroom attendance.
        </Text>
        <TouchableOpacity style={styles.grantBtn} onPress={requestPermission}>
          <Text style={styles.grantBtnText}>Grant Camera Access</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backLink} onPress={onBack}>
          <Text style={styles.backLinkText}>Return to Dashboard</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera View */}
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing={facing}
        enableTorch={torch}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      />

      {/* Top Overlay Controls */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconBtn} onPress={onBack}>
          <Ionicons name="arrow-back" size={22} color="#ffffff" />
        </TouchableOpacity>

        <View style={styles.topTitleBox}>
          <Text style={styles.topTitle}>Student QR Scanner</Text>
          <Text style={styles.topSubtitle}>Align QR code inside box</Text>
        </View>

        <View style={styles.topActionGroup}>
          <TouchableOpacity
            style={[styles.iconBtn, torch && styles.iconBtnActive]}
            onPress={() => setTorch(!torch)}
          >
            <Ionicons name={torch ? 'flash' : 'flash-off'} size={20} color="#ffffff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}
          >
            <Ionicons name="camera-reverse" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Center Targeting Box Reticle */}
      <View style={styles.reticleContainer}>
        <View style={styles.reticle}>
          {/* Corner brackets */}
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />
          {/* Laser guide line */}
          <View style={styles.laserLine} />
        </View>
        <Text style={styles.hintText}>Hold steady for instant verification</Text>
      </View>

      {/* Bottom Controls */}
      <View style={styles.bottomBar}>
        {showManualInput ? (
          <View style={styles.manualInputRow}>
            <TextInput
              style={styles.manualInput}
              value={manualCode}
              onChangeText={setManualCode}
              placeholder="Enter QR token (QR-...)"
              placeholderTextColor="#64748b"
              autoCapitalize="none"
              autoFocus
            />
            <TouchableOpacity style={styles.manualSubmitBtn} onPress={handleManualSubmit}>
              <Text style={styles.manualSubmitText}>Check In</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.manualCancelBtn}
              onPress={() => setShowManualInput(false)}
            >
              <Ionicons name="close" size={20} color="#94a3b8" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.manualToggleBtn}
            onPress={() => setShowManualInput(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="keypad-outline" size={18} color="#00c2ff" />
            <Text style={styles.manualToggleText}>Manual Code Entry</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Scan Result Modal */}
      <ScanResultModal
        visible={modalVisible}
        result={result}
        onScanNext={handleScanNext}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
};

const { width } = Dimensions.get('window');
const RETICLE_SIZE = width * 0.72;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#0c0e12',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    gap: 12,
  },
  centerText: {
    color: '#94a3b8',
    fontSize: 14,
    marginTop: 10,
  },
  permissionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  permissionDesc: {
    color: '#94a3b8',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  grantBtn: {
    backgroundColor: '#00b4d8',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 10,
  },
  grantBtnText: {
    color: '#090d14',
    fontSize: 13,
    fontWeight: '900',
  },
  backLink: {
    padding: 10,
  },
  backLinkText: {
    color: '#64748b',
    fontSize: 12,
  },
  topBar: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(15,19,28,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  iconBtnActive: {
    backgroundColor: 'rgba(0,194,255,0.3)',
    borderColor: '#00c2ff',
  },
  topTitleBox: {
    alignItems: 'center',
  },
  topTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },
  topSubtitle: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
  },
  topActionGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  reticleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reticle: {
    width: RETICLE_SIZE,
    height: RETICLE_SIZE,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(0,194,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: '#00c2ff',
  },
  cornerTL: {
    top: -2,
    left: -2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 18,
  },
  cornerTR: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 18,
  },
  cornerBL: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 18,
  },
  cornerBR: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 18,
  },
  laserLine: {
    width: '90%',
    height: 2,
    backgroundColor: '#00c2ff',
    shadowColor: '#00c2ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 4,
  },
  hintText: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 20,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    zIndex: 10,
  },
  manualToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(15,19,28,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(0,194,255,0.3)',
    paddingVertical: 14,
    borderRadius: 18,
  },
  manualToggleText: {
    color: '#00c2ff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  manualInputRow: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: 'rgba(15,19,28,0.95)',
    padding: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#242f44',
  },
  manualInput: {
    flex: 1,
    backgroundColor: '#090d14',
    borderRadius: 12,
    paddingHorizontal: 12,
    color: '#ffffff',
    fontSize: 13,
    fontFamily: 'monospace',
  },
  manualSubmitBtn: {
    backgroundColor: '#00b4d8',
    paddingHorizontal: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  manualSubmitText: {
    color: '#090d14',
    fontWeight: '900',
    fontSize: 12,
  },
  manualCancelBtn: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
