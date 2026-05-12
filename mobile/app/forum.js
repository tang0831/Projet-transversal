import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export default function Forum() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMsg, setNewMsg] = useState('');
  const [user, setUser] = useState(null);

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMessages = async () => {
    if (!user?.district) return;
    try {
      const res = await api.get(`/forum/messages?district=${user.district}`);
      setMessages(res.data);
      
      // On enregistre l'ID du dernier message vu pour les notifications
      if (res.data.length > 0) {
        const lastId = res.data[res.data.length - 1].id;
        await AsyncStorage.setItem(`lastRead_${user.district}`, lastId.toString());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchMessages();
    }
  }, [user]);

  const sendMessage = async () => {
    if (!newMsg.trim() || !user) return;
    try {
      await api.post('/forum/messages', { 
        id_utilisateur: user.id_utilisateur, 
        contenu: newMsg 
      });
      setNewMsg('');
      fetchMessages();
    } catch (e) {
      console.error(e);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.msgCard}>
      <Text style={styles.user}>{item.username} ({item.role})</Text>
      <Text style={styles.content}>{item.contenu}</Text>
      <Text style={styles.date}>{item.date}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <View style={styles.districtBadge}>
        <Text style={styles.districtText}>District : {user?.district || 'Chargement...'}</Text>
      </View>
      
      {loading ? (
        <ActivityIndicator size="large" color="#003366" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
      <View style={styles.inputArea}>
        <TextInput 
          style={styles.input} 
          placeholder="Écrire un message au district..." 
          value={newMsg}
          onChangeText={setNewMsg}
          multiline
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Text style={styles.sendText}>Envoyer</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  districtBadge: { backgroundColor: '#003366', padding: 8, alignItems: 'center' },
  districtText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  list: { padding: 15 },
  msgCard: { backgroundColor: '#fff', padding: 12, borderRadius: 12, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.05, elevation: 1 },
  user: { fontWeight: 'bold', color: '#003366', fontSize: 13 },
  content: { fontSize: 15, color: '#333', marginTop: 5 },
  date: { fontSize: 10, color: '#999', marginTop: 8, textAlign: 'right' },
  inputArea: { flexDirection: 'row', padding: 10, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#ddd' },
  input: { flex: 1, backgroundColor: '#f0f2f5', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 8, maxHeight: 100 },
  sendBtn: { marginLeft: 10, justifyContent: 'center', paddingHorizontal: 10 },
  sendText: { color: '#003366', fontWeight: 'bold' }
});
