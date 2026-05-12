import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export default function Home() {
  const router = useRouter();
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUserAndCheckMessages();
    const interval = setInterval(loadUserAndCheckMessages, 30000); // Vérifier toutes les 30s
    return () => clearInterval(interval);
  }, []);

  const loadUserAndCheckMessages = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        if (parsedUser.district) {
          const res = await api.get(`/forum/messages?district=${parsedUser.district}`);
          const lastRead = await AsyncStorage.getItem(`lastRead_${parsedUser.district}`);
          
          if (res.data.length > 0) {
            const lastMsgId = res.data[res.data.length - 1].id;
            if (lastRead === null || parseInt(lastMsgId) > parseInt(lastRead)) {
              setHasNewMessages(true);
            } else {
              setHasNewMessages(false);
            }
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const menuItems = [
    { id: 'profile', title: 'Mon Profil', icon: '👤' },
    { id: 'citoyens', title: 'Citoyens', icon: '👥' },
    { id: 'actes', title: 'Actes', icon: '📄' },
    { id: 'localites', title: 'Localités', icon: '📍' },
    { id: 'forum', title: 'Forum', icon: '💬', badge: hasNewMessages },
    { id: 'optimisation', title: 'Logistique', icon: '🚀' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.welcomeText}>Tableau de Bord</Text>
          <TouchableOpacity onPress={() => router.push('/profile')} style={styles.profileIcon}>
            {user?.photo ? (
              <Image source={{ uri: user.photo }} style={{width: 30, height: 30, borderRadius: 15}} />
            ) : <Text style={{fontSize: 24}}>⚙️</Text>}
          </TouchableOpacity>
        </View>
        <Text style={styles.subText}>République de Madagascar - Vision 2035</Text>
      </View>

      <View style={styles.grid}>
        {menuItems.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={styles.card}
            onPress={() => {
              if (item.id === 'forum') setHasNewMessages(false);
              router.push(`/${item.id}`);
            }}
          >
            <View>
              <Text style={styles.icon}>{item.icon}</Text>
              {item.badge && <View style={styles.badge} />}
            </View>
            <Text style={styles.cardTitle}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={() => router.replace('/')}
      >
        <Text style={styles.logoutText}>Déconnexion</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { padding: 30, backgroundColor: '#003366', borderBottomLeftRadius: 30, borderBottomRightRadius: 30, marginBottom: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  profileIcon: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 12 },
  welcomeText: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  subText: { fontSize: 14, color: '#ccc', marginTop: 5 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: 10, justifyContent: 'space-between' },
  card: { backgroundColor: '#fff', width: '46%', padding: 20, borderRadius: 15, marginBottom: 15, alignItems: 'center', elevation: 3 },
  icon: { fontSize: 40, marginBottom: 10 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
  badge: { position: 'absolute', top: 0, right: 0, width: 12, height: 12, borderRadius: 6, backgroundColor: '#FF0000', borderWidth: 2, borderColor: '#fff' },
  logoutButton: { margin: 20, padding: 15, backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#ff4444', alignItems: 'center' },
  logoutText: { color: '#ff4444', fontWeight: 'bold' },
});
