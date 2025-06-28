import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

interface EmergencyService {
  id: string;
  service_name: string;
  phone_number: string;
  service_type: string;
  region: string;
  is_active: boolean;
}

interface EmergencyContact {
  id: string;
  name: string;
  phone_number: string;
  relationship: string;
  priority_order: number;
  is_active: boolean;
}

export const EmergencyScreen: React.FC = () => {
  const { user } = useAuth();
  const [emergencyServices, setEmergencyServices] = useState<EmergencyService[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmergencyData();
  }, []);

  const fetchEmergencyData = async () => {
    try {
      setLoading(true);
      
      // Fetch emergency services
      const { data: services, error: servicesError } = await supabase
        .from('emergency_services')
        .select('*')
        .eq('is_active', true)
        .order('service_type');

      if (servicesError) throw servicesError;

      // Fetch user's emergency contacts
      const { data: contacts, error: contactsError } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_active', true)
        .order('priority_order');

      if (contactsError) throw contactsError;

      setEmergencyServices(services || []);
      setEmergencyContacts(contacts || []);
    } catch (error) {
      console.error('Error fetching emergency data:', error);
      Alert.alert('Error', 'Failed to load emergency contacts');
    } finally {
      setLoading(false);
    }
  };

  const makeCall = async (phoneNumber: string, contactName: string, contactType: 'emergency' | 'buddy') => {
    try {
      // Log the call attempt
      await logCall(phoneNumber, contactName, contactType);
      
      // Make the call
      const url = `tel:${phoneNumber}`;
      const supported = await Linking.canOpenURL(url);
      
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Phone calling is not supported on this device');
      }
    } catch (error) {
      console.error('Error making call:', error);
      Alert.alert('Error', 'Failed to make call');
    }
  };

  const logCall = async (phoneNumber: string, contactName: string, contactType: 'emergency' | 'buddy') => {
    try {
      await supabase
        .from('call_logs')
        .insert({
          user_id: user?.id,
          contact_type: contactType,
          phone_number: phoneNumber,
          contact_name: contactName,
          call_status: 'initiated',
          emergency_context: {
            timestamp: new Date().toISOString(),
            location: 'Unknown', // TODO: Add location services
          },
        });
    } catch (error) {
      console.error('Error logging call:', error);
    }
  };

  const confirmEmergencyCall = (service: EmergencyService) => {
    Alert.alert(
      'Emergency Call',
      `Are you sure you want to call ${service.service_name} (${service.phone_number})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Call Now', 
          style: 'destructive',
          onPress: () => makeCall(service.phone_number, service.service_name, 'emergency')
        },
      ]
    );
  };

  const confirmBuddyCall = (contact: EmergencyContact) => {
    Alert.alert(
      'Call Emergency Contact',
      `Call ${contact.name} (${contact.relationship})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Call', 
          onPress: () => makeCall(contact.phone_number, contact.name, 'buddy')
        },
      ]
    );
  };

  const getServiceTypeColor = (serviceType: string) => {
    switch (serviceType) {
      case 'emergency': return '#dc2626';
      case 'medical': return '#ea580c';
      case 'mental_health': return '#7c3aed';
      default: return '#374151';
    }
  };

  const getServiceTypeIcon = (serviceType: string) => {
    switch (serviceType) {
      case 'emergency': return '🚨';
      case 'medical': return '🏥';
      case 'mental_health': return '💙';
      default: return '📞';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Loading emergency contacts...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Emergency Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Emergency Contacts</Text>
          <Text style={styles.headerSubtitle}>
            Tap any contact to call immediately
          </Text>
        </View>

        {/* Emergency Services Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚨 Emergency Services</Text>
          <Text style={styles.sectionSubtitle}>
            Official emergency and crisis helplines
          </Text>
          
          {emergencyServices.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={[
                styles.emergencyCard,
                { borderLeftColor: getServiceTypeColor(service.service_type) }
              ]}
              onPress={() => confirmEmergencyCall(service)}
            >
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Text style={styles.serviceIcon}>
                    {getServiceTypeIcon(service.service_type)}
                  </Text>
                  <View style={styles.serviceInfo}>
                    <Text style={styles.serviceName}>{service.service_name}</Text>
                    <Text style={styles.serviceType}>
                      {service.service_type.replace('_', ' ').toUpperCase()}
                    </Text>
                  </View>
                </View>
                <Text style={styles.phoneNumber}>{service.phone_number}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Personal Emergency Contacts Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👥 Your Emergency Contacts</Text>
          <Text style={styles.sectionSubtitle}>
            Personal contacts in priority order
          </Text>
          
          {emergencyContacts.length > 0 ? (
            emergencyContacts.map((contact) => (
              <TouchableOpacity
                key={contact.id}
                style={styles.contactCard}
                onPress={() => confirmBuddyCall(contact)}
              >
                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <View style={styles.priorityBadge}>
                      <Text style={styles.priorityText}>{contact.priority_order}</Text>
                    </View>
                    <View style={styles.contactInfo}>
                      <Text style={styles.contactName}>{contact.name}</Text>
                      <Text style={styles.contactRelationship}>{contact.relationship}</Text>
                    </View>
                  </View>
                  <Text style={styles.phoneNumber}>{contact.phone_number}</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No emergency contacts added</Text>
              <Text style={styles.emptyStateSubtext}>
                Add emergency contacts in your profile settings
              </Text>
            </View>
          )}
        </View>

        {/* Call All Contacts Button */}
        {emergencyContacts.length > 0 && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.callAllButton}
              onPress={() => {
                Alert.alert(
                  'Call All Contacts',
                  'This will call all your emergency contacts in priority order. Continue?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { 
                      text: 'Call All', 
                      style: 'destructive',
                      onPress: () => {
                        emergencyContacts.forEach((contact, index) => {
                          setTimeout(() => {
                            makeCall(contact.phone_number, contact.name, 'buddy');
                          }, index * 2000); // 2 second delay between calls
                        });
                      }
                    },
                  ]
                );
              }}
            >
              <Text style={styles.callAllButtonText}>📞 Call All Contacts</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Call History Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.historyButton}
            onPress={() => {
              // TODO: Navigate to Call History screen
              Alert.alert('Call History', 'Call history feature coming soon!');
            }}
          >
            <Text style={styles.historyButtonText}>📋 View Call History</Text>
          </TouchableOpacity>
        </View>

        {/* Safety Information */}
        <View style={styles.section}>
          <View style={styles.safetyInfo}>
            <Text style={styles.safetyTitle}>⚠️ Important Safety Information</Text>
            <Text style={styles.safetyText}>
              • For immediate life-threatening emergencies, call 999
            </Text>
            <Text style={styles.safetyText}>
              • For mental health crisis support, contact Taliankasih or BefriendersKL
            </Text>
            <Text style={styles.safetyText}>
              • All calls are logged for your safety and support
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
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  emergencyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  serviceType: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  priorityBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  priorityText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  contactRelationship: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  phoneNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b82f6',
    textAlign: 'right',
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  callAllButton: {
    backgroundColor: '#dc2626',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  callAllButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  historyButton: {
    backgroundColor: '#6b7280',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  historyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  safetyInfo: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f59e0b',
    marginBottom: 20,
  },
  safetyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 8,
  },
  safetyText: {
    fontSize: 14,
    color: '#92400e',
    marginBottom: 4,
  },
});
