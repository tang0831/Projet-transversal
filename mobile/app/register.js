import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Modal, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import api, { authService } from '../services/api';

export default function Register() {
  const [nom, setNom] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('AGENT'); 
  const [loading, setLoading] = useState(false);
  const [localites, setLocalites] = useState([]);
  const [filteredLocs, setFilteredLocs] = useState([]);
  const [searchLoc, setSearchLoc] = useState('');
  const [selectedLoc, setSelectedLoc] = useState(null);
  const [showLocModal, setShowLocModal] = useState(false);
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [manualCommune, setManualCommune] = useState('');
  const [manualDistrict, setManualDistrict] = useState('');
  
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchLocalites();
  }, []);

  const fetchLocalites = async () => {
    try {
      const res = await api.get('/localites');
      if (Array.isArray(res.data)) {
        const validData = res.data.filter(l => l && l.id_localite !== undefined);
        setLocalites(validData);
        setFilteredLocs(validData);
      }
    } catch (e) {
      console.error('[Register] Erreur localités:', e);
    }
  };

  const handleSearchLoc = (text) => {
    setSearchLoc(text);
    if (!text) {
      setFilteredLocs(localites);
      return;
    }
    const filtered = localites.filter(l => 
      l.nom_commune.toLowerCase().includes(text.toLowerCase()) || 
      l.district.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredLocs(filtered);
  };

  const handleRegister = async () => {
    if (!nom || !password) {
      Alert.alert('Erreur', 'Veuillez remplir votre nom et mot de passe');
      return;
    }

    if (!isManualEntry && !selectedLoc) {
      Alert.alert('Erreur', 'Veuillez choisir une localité ou la saisir manuellement');
      return;
    }

    if (isManualEntry && (!manualCommune || !manualDistrict)) {
      Alert.alert('Erreur', 'Veuillez saisir le nom de votre commune et district');
      return;
    }

    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');
    
    try {
      const payload = {
        nom,
        mot_de_passe: password,
        role: role
      };

      if (isManualEntry) {
        payload.new_commune = manualCommune;
        payload.new_district = manualDistrict;
      } else {
        payload.id_localite = selectedLoc.id_localite;
      }

      const response = await authService.register(payload);
      
      if (response.status === 200 || response.status === 201 || (response.data && response.data.status === 'success')) {
        setSuccessMessage('✅ Compte créé avec succès !');
        Alert.alert('Succès', 'Compte créé avec succès', [
          { text: 'OK', onPress: () => router.replace('/login') }
        ]);
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setErrorMessage('⚠️ Compte déjà créé');
      } else {
        setErrorMessage('❌ Impossible de créer le compte');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {successMessage ? (
        <View style={styles.successBox}><Text style={styles.successText}>{successMessage}</Text></View>
      ) : null}
      {errorMessage ? (
        <View style={styles.errorBox}><Text style={styles.errorText}>{errorMessage}</Text></View>
      ) : null}

      <Text style={styles.label}>Nom d'utilisateur</Text>
      <TextInput
        style={styles.input}
        value={nom}
        onChangeText={setNom}
        placeholder="Choisissez un nom"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Mot de passe</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="********"
        secureTextEntry
      />

      <Text style={styles.label}>Localité</Text>
      {!isManualEntry ? (
        <TouchableOpacity style={styles.locSelector} onPress={() => setShowLocModal(true)}>
          <Text style={selectedLoc ? styles.locSelectedText : styles.locPlaceholderText}>
            {selectedLoc ? `${selectedLoc.nom_commune} (${selectedLoc.district})` : 'Choisir ma localité...'}
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.manualEntryContainer}>
          <TextInput 
            style={styles.manualInput} 
            placeholder="Nom de la commune" 
            value={manualCommune} 
            onChangeText={setManualCommune} 
          />
          <TextInput 
            style={styles.manualInput} 
            placeholder="Nom du district" 
            value={manualDistrict} 
            onChangeText={setManualDistrict} 
          />
          <TouchableOpacity onPress={() => setIsManualEntry(false)}>
            <Text style={styles.switchModeText}>Retour à la liste</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.label}>Rôle</Text>
      <View style={styles.roleContainer}>
        {['AGENT', 'ADMIN', 'CITOYEN'].map((r) => (
          <TouchableOpacity 
            key={r}
            style={[styles.roleButton, role === r && styles.activeRole]} 
            onPress={() => setRole(r)}
          >
            <Text style={[styles.roleText, role === r && styles.activeRoleText]}>{r}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Créer mon compte</Text>}
      </TouchableOpacity>

      <Modal visible={showLocModal} animationType="fade">
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <TextInput 
              style={styles.searchInput} 
              placeholder="Rechercher une commune..." 
              value={searchLoc}
              onChangeText={handleSearchLoc}
            />
            <TouchableOpacity onPress={() => setShowLocModal(false)}>
              <Text style={styles.closeModalText}>X</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.addManualBtn}
            onPress={() => {
              setIsManualEntry(true);
              setShowLocModal(false);
            }}
          >
            <Text style={styles.addManualBtnText}>+ Ma localité n'est pas dans la liste</Text>
          </TouchableOpacity>

          <FlatList
            data={filteredLocs}
            keyExtractor={(item, index) => item?.id_localite?.toString() || index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.locItem} 
                onPress={() => {
                  setSelectedLoc(item);
                  setIsManualEntry(false);
                  setShowLocModal(false);
                }}
              >
                <Text style={styles.locItemName}>{item.nom_commune}</Text>
                <Text style={styles.locItemSub}>{item.district} - {item.region}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text style={styles.emptyText}>Aucun résultat trouvé</Text>}
          />
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff', flexGrow: 1, justifyContent: 'center' },
  label: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 8 },
  successBox: { backgroundColor: '#e6fffa', padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#38b2ac', marginBottom: 20, alignItems: 'center' },
  successText: { color: '#234e52', fontWeight: 'bold', fontSize: 16 },
  errorBox: { backgroundColor: '#fff5f5', padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#feb2b2', marginBottom: 20, alignItems: 'center' },
  errorText: { color: '#9b2c2c', fontWeight: 'bold', fontSize: 16 },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, marginBottom: 20, fontSize: 16 },
  locSelector: { borderWidth: 1, borderColor: '#ddd', padding: 15, borderRadius: 8, marginBottom: 25, backgroundColor: '#f9f9f9' },
  locPlaceholderText: { color: '#999', fontSize: 16 },
  locSelectedText: { color: '#003366', fontWeight: 'bold', fontSize: 16 },
  manualEntryContainer: { marginBottom: 25 },
  manualInput: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, marginBottom: 10, fontSize: 16 },
  switchModeText: { color: '#003366', textDecorationLine: 'underline', textAlign: 'right' },
  roleContainer: { flexDirection: 'row', marginBottom: 30, gap: 10 },
  roleButton: { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#003366', alignItems: 'center' },
  activeRole: { backgroundColor: '#003366' },
  roleText: { color: '#003366', fontWeight: '600' },
  activeRoleText: { color: '#fff' },
  button: { backgroundColor: '#003366', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 20 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  modalContent: { flex: 1, backgroundColor: '#fff', paddingTop: 50 },
  modalHeader: { flexDirection: 'row', padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee', alignItems: 'center' },
  searchInput: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 20, paddingHorizontal: 15, height: 40 },
  closeModalText: { marginLeft: 15, color: '#ff4444', fontWeight: 'bold', fontSize: 20 },
  addManualBtn: { padding: 15, backgroundColor: '#f0f7ff', borderBottomWidth: 1, borderBottomColor: '#e0eaff' },
  addManualBtnText: { color: '#003366', fontWeight: 'bold', textAlign: 'center' },
  locItem: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  locItemName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  locItemSub: { fontSize: 14, color: '#666', marginTop: 4 },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#999' }
});
