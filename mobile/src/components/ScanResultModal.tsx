import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { QrScanResponse } from '../types';

interface ScanResultModalProps {
  visible: boolean;
  result: QrScanResponse | null;
  onScanNext: () => void;
  onClose: () => void;
}

export const ScanResultModal: React.FC<ScanResultModalProps> = ({
  visible,
  result,
  onScanNext,
  onClose,
}) => {
  if (!result) return null;

  const isSuccess = result.attendanceStatus === 'PRESENT';
  const isAlreadyMarked = result.attendanceStatus === 'ALREADY_MARKED';

  const themeColor = isSuccess
    ? '#10b981' // Emerald
    : isAlreadyMarked
    ? '#f59e0b' // Amber
    : '#f43f5e'; // Rose

  const statusTitle = isSuccess
    ? 'ATTENDANCE MARKED'
    : isAlreadyMarked
    ? 'ALREADY MARKED TODAY'
    : 'VERIFICATION FAILED';

  const statusIcon = isSuccess
    ? 'checkmark-circle'
    : isAlreadyMarked
    ? 'alert-circle'
    : 'close-circle';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.card, { borderColor: themeColor + '60' }]}>
          {/* Header Status */}
          <View style={styles.statusHeader}>
            <View style={[styles.statusBadge, { backgroundColor: themeColor + '20', borderColor: themeColor }]}>
              <Ionicons name={statusIcon} size={18} color={themeColor} />
              <Text style={[styles.statusText, { color: themeColor }]}>
                {statusTitle}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          {/* Student Info */}
          {result.student ? (
            <View style={styles.body}>
              <View style={styles.avatarRow}>
                <View style={[styles.avatarCircle, { backgroundColor: themeColor + '25' }]}>
                  <Text style={[styles.avatarText, { color: themeColor }]}>
                    {result.student.fullName?.charAt(0) || 'S'}
                  </Text>
                </View>
                <View style={styles.nameContainer}>
                  <Text style={styles.studentName} numberOfLines={1}>
                    {result.student.fullName}
                  </Text>
                  <Text style={styles.studentId}>
                    {result.student.studentIdNumber} • {result.student.batchName}
                  </Text>
                </View>
              </View>

              {/* Session Info Table */}
              <View style={styles.detailsBox}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Session:</Text>
                  <Text style={styles.detailValue} numberOfLines={1}>
                    {result.sessionTitle || 'Classroom Lecture'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Check-In Time:</Text>
                  <Text style={styles.detailValue}>
                    {result.attendanceTime || new Date().toLocaleTimeString()}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Method:</Text>
                  <Text style={[styles.detailValue, { color: '#00c2ff' }]}>
                    {result.source || 'QR_SCAN'}
                  </Text>
                </View>
                {result.existingMarkedAt ? (
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: '#f59e0b' }]}>Original Check-In:</Text>
                    <Text style={[styles.detailValue, { color: '#f59e0b', fontWeight: 'bold' }]}>
                      {result.existingMarkedAt}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          ) : (
            <View style={styles.errorContainer}>
              <Ionicons name="warning-outline" size={40} color="#f43f5e" />
              <Text style={styles.errorMsg}>
                {result.message || 'Invalid or revoked student identity QR code.'}
              </Text>
            </View>
          )}

          {/* Action Button: Scan Next Student */}
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#00b4d8' }]}
            onPress={onScanNext}
            activeOpacity={0.8}
          >
            <Ionicons name="scan" size={18} color="#0a0d14" />
            <Text style={styles.actionBtnText}>Scan Next Student</Text>
            <Ionicons name="arrow-forward" size={18} color="#0a0d14" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: width - 40,
    maxWidth: 420,
    backgroundColor: '#0f131c',
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  closeBtn: {
    padding: 6,
  },
  body: {
    marginBottom: 20,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '900',
  },
  nameContainer: {
    flex: 1,
  },
  studentName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  studentId: {
    color: '#94a3b8',
    fontSize: 12,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  detailsBox: {
    backgroundColor: '#151a26',
    borderRadius: 16,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: '#20283b',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    color: '#94a3b8',
    fontSize: 12,
  },
  detailValue: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: '600',
    maxWidth: '65%',
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 10,
    marginBottom: 16,
  },
  errorMsg: {
    color: '#fda4af',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
  },
  actionBtnText: {
    color: '#090d14',
    fontSize: 13,
    fontWeight: '900',
  },
});
