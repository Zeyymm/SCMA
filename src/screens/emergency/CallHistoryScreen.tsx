import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

interface CallLog {
  id: string;
  contact_type: 'emergency' | 'buddy';
  contact_name: string;
  phone_number: string;
  call_status: 'initiated' | 'answered' | 'missed' | 'failed';
  call_duration: number;
  emergency_context: any;
  called_at: string;
}

export const CallHistoryScreen: React.FC = () => {
  const { user } = useAuth();
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchCallHistory();
  }, []);

  const fetchCallHistory = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('call_logs')
        .select('*')
        .eq('user_id', user?.id)
        .order('called_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setCallLogs(data || []);
    } catch (error) {
      console.error('Error fetching call history:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCallHistory();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCallStatusColor = (status: string) => {
    switch (status) {
      case 'answered': return '#10b981';
      case 'initiated': return '#3b82f6';
      case 'missed': return '#f59e0b';
      case 'failed': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getCallStatusIcon = (status: string) => {
    switch (status) {
      case 'answered': return '✅';
      case 'initiated': return '📞';
      case 'missed': return '⚠️';
      case 'failed': return '❌';
      default: return '📞';
    }
  };

  const getContactTypeIcon = (type: string) => {
    return type === 'emergency' ? '🚨' : '👥';
  };

  const formatDuration = (seconds: number) => {
    if (seconds === 0) return 'No duration';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Loading call history...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Call History</Text>
          <Text style={styles.headerSubtitle}>
            Your emergency and buddy call logs
          </Text>
        </View>

        {/* Statistics */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{callLogs.length}</Text>
            <Text style={styles.statLabel}>Total Calls</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {callLogs.filter(log => log.contact_type === 'emergency').length}
            </Text>
            <Text style={styles.statLabel}>Emergency</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {callLogs.filter(log => log.contact_type === 'buddy').length}
            </Text>
            <Text style={styles.statLabel}>Buddy Calls</Text>
          </View>
        </View>

        {/* Call Logs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Calls</Text>
          
          {callLogs.length > 0 ? (
            callLogs.map((log) => (
              <View key={log.id} style={styles.callCard}>
                <View style={styles.callHeader}>
                  <View style={styles.callInfo}>
                    <View style={styles.callTitleRow}>
                      <Text style={styles.callTypeIcon}>
                        {getContactTypeIcon(log.contact_type)}
                      </Text>
                      <Text style={styles.contactName}>{log.contact_name}</Text>
                      <View style={[
                        styles.statusBadge,
                        { backgroundColor: getCallStatusColor(log.call_status) }
                      ]}>
                        <Text style={styles.statusIcon}>
                          {getCallStatusIcon(log.call_status)}
                        </Text>
                        <Text style={styles.statusText}>
                          {log.call_status.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.phoneNumber}>{log.phone_number}</Text>
                  </View>
                </View>
                
                <View style={styles.callDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Time:</Text>
                    <Text style={styles.detailValue}>
                      {formatTime(log.called_at)} • {formatDate(log.called_at)}
                    </Text>
                  </View>
                  
                  {log.call_duration > 0 && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Duration:</Text>
                      <Text style={styles.detailValue}>
                        {formatDuration(log.call_duration)}
                      </Text>
                    </View>
                  )}
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Type:</Text>
                    <Text style={styles.detailValue}>
                      {log.contact_type === 'emergency' ? 'Emergency Service' : 'Emergency Contact'}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>📞</Text>
              <Text style={styles.emptyStateText}>No calls made yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Your emergency and buddy calls will appear here
              </Text>
            </View>
          )}
        </View>

        {/* Emergency Information */}
        <View style={styles.section}>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>📋 Call Log Information</Text>
            <Text style={styles.infoText}>
              • All emergency and buddy calls are automatically logged
            </Text>
            <Text style={styles.infoText}>
              • Call logs help track your emergency response history
            </Text>
            <Text style={styles.infoText}>
              • Duration tracking may not be available for all calls
            </Text>
            <Text style={styles.infoText}>
              • Your privacy is protected - logs are only visible to you
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  callCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  callHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  callInfo: {
    flex: 1,
  },
  callTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  callTypeIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  contactName: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  phoneNumber: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  callDetails: {
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '600',
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#0ea5e9',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0c4a6e',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#0c4a6e',
    marginBottom: 4,
  },
});
