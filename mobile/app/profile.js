import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, Alert, Image, TextInput, ActivityIndicator, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import api from '../services/api';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [loading, setLoading] = useState(false);
  const [acts, setActs] = useState([]);
  const [loadingActs, setLoadingActs] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setEditName(parsedUser.username);
        fetchActs(parsedUser);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchActs = async (currUser) => {
    setLoadingActs(true);
    try {
      // Pour le test, on cherche les actes liés au nom de l'utilisateur s'il n'a pas d'id_citoyen
      const res = await api.get('/actes');
      // On simule un filtrage par "nom" pour l'historique personnel dans ce prototype
      const filtered = res.data.filter(a => a.id_citoyen === currUser.id_utilisateur || a.numero_registre.includes(currUser.username));
      setActs(filtered);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingActs(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled) {
      const base64Photo = `data:image/jpeg;base64,${result.assets[0].base64}`;
      updateProfile({ photo: base64Photo });
    }
  };

  const updateProfile = async (updates) => {
    setLoading(true);
    try {
      const res = await api.put(`/utilisateurs/${user.id_utilisateur}`, {
        ...user,
        ...updates,
        nom: updates.username || user.username,
      });
      
      if (res.data.status === 'success') {
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        Alert.alert("Succès", "Profil mis à jour");
        setIsEditing(false);
      }
    } catch (e) {
      Alert.alert("Erreur", "Impossible de mettre à jour le profil");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Déconnexion", "Voulez-vous vraiment vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      { text: "Oui", onPress: async () => { await AsyncStorage.removeItem('user'); router.replace('/'); } }
    ]);
  };

  if (!user) return <View style={styles.loading}><ActivityIndicator size="large" color="#003366" /></View>;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
            {user.photo ? (
              <Image source={{ uri: user.photo }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{user.username?.charAt(0).toUpperCase()}</Text>
              </View>
            )}
            <View style={styles.editIconBadge}><Text style={{fontSize: 12}}>📷</Text></View>
          </TouchableOpacity>
          
          {isEditing ? (
            <View style={styles.editRow}>
              <TextInput style={styles.editInput} value={editName} onChangeText={setEditName} />
              <TouchableOpacity onPress={() => updateProfile({ username: editName })} style={styles.saveBtn}>
                <Text style={{color: '#fff'}}>OK</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={styles.userName}>{user.username}</Text>
              <TouchableOpacity onPress={() => setIsEditing(true)} style={{marginLeft: 10}}>
                <Text>✏️</Text>
              </TouchableOpacity>
            </View>
          )}
          
          <View style={styles.roleBadge}><Text style={styles.roleText}>{user.role}</Text></View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ma Localisation</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>District</Text>
            <Text style={styles.infoValue}>{user.district || 'N/A'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mon Historique d'Actes</Text>
          {loadingActs ? <ActivityIndicator color="#003366" /> : (
            acts.length > 0 ? acts.map((acte, index) => (
              <View key={index} style={styles.acteItem}>
                <Text style={styles.acteType}>{acte.type_acte}</Text>
                <Text style={styles.acteDate}>N° {acte.numero_registre} • {acte.date_acte}</Text>
              </View>
            )) : <Text style={styles.emptyText}>Aucun acte associé trouvé.</Text>
          )}
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutBtnText}>Se déconnecter</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingBottom: 40 },
  header: { backgroundColor: '#003366', paddingVertical: 40, alignItems: 'center', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  avatarContainer: { position: 'relative', marginBottom: 15 },
  avatarCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', elevation: 5 },
  avatarImage: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: '#fff' },
  avatarText: { fontSize: 40, fontWeight: 'bold', color: '#003366' },
  editIconBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#fff', width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', elevation: 3 },
  userName: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF' },
  roleBadge: { backgroundColor: '#FF0000', paddingHorizontal: 15, paddingVertical: 5, borderRadius: 20, marginTop: 10 },
  roleText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 },
  editRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 10 },
  editInput: { color: '#000', fontSize: 18, width: 150, padding: 5 },
  saveBtn: { backgroundColor: '#007E33', padding: 5, borderRadius: 5, marginLeft: 5 },
  section: { paddingHorizontal: 25, marginTop: 25 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginBottom: 15 },
  infoCard: { backgroundColor: '#FFFFFF', padding: 15, borderRadius: 12, elevation: 2 },
  infoLabel: { color: '#64748B', fontSize: 12 },
  infoValue: { color: '#1E293B', fontSize: 16, fontWeight: 'bold' },
  acteItem: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: '#FF0000', elevation: 1 },
  acteType: { fontWeight: 'bold', color: '#003366' },
  acteDate: { fontSize: 12, color: '#666', marginTop: 3 },
  emptyText: { color: '#94A3B8', fontStyle: 'italic', textAlign: 'center' },
  logoutBtn: { margin: 25, padding: 15, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#EF4444' },
  logoutBtnText: { color: '#EF4444', fontWeight: 'bold' }
});
