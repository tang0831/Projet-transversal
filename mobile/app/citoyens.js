import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Modal, ScrollView, Alert, Switch } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import api from '../services/api';

export default function Citoyens() {
  const [citoyens, setCitoyens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const defaultForm = { 
    nom: '', 
    prenom: '', 
    date_naissance: new Date().toISOString().split('T')[0], 
    lieu_naissance: '', 
    est_vivant: true, 
    sexe: 'M', 
    numero_cin: '' 
  };
  const [form, setForm] = useState(defaultForm);

  const fetchCitoyens = async (query = '') => {
    setLoading(true);
    try {
      const res = await api.get(`/citoyens?search=${query}`);
      // S'assurer que les données sont bien un tableau
      setCitoyens(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
      setCitoyens([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCitoyens(); }, []);

  const exportPDF = async () => {
    setExporting(true);
    try {
      const filename = 'liste_citoyens.pdf';
      const fileUri = `${FileSystem.documentDirectory}${filename}`;
      
      const downloadUrl = `${api.defaults.baseURL}/citoyens/export/pdf`;
      const downloadRes = await FileSystem.downloadAsync(downloadUrl, fileUri);
      
      if (downloadRes.status === 200) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert("Erreur", "Le serveur n'a pas pu générer le PDF");
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Erreur", "Impossible d'exporter le PDF.");
    } finally {
      setExporting(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.nom || !form.prenom || !form.date_naissance || !form.numero_cin) {
      Alert.alert("Champs requis", "Le nom, prénom, date de naissance et CIN sont obligatoires.");
      return;
    }

    try {
      if (editingId) {
        await api.put(`/citoyens/${editingId}`, form);
      } else {
        await api.post('/citoyens', form);
      }
      setModalVisible(false);
      setEditingId(null);
      setForm(defaultForm);
      fetchCitoyens();
    } catch (e) {
      console.error(e);
      Alert.alert("Erreur", "Vérifiez que le format de la date est YYYY-MM-DD.");
    }
  };

  const deleteCitoyen = (id) => {
    Alert.alert("Confirmation", "Supprimer ce citoyen ?", [
      { text: "Annuler", style: "cancel" },
      { text: "Supprimer", style: "destructive", onPress: async () => {
        try {
          await api.delete(`/citoyens/${id}`);
          fetchCitoyens();
        } catch (e) {
          Alert.alert("Erreur", "Suppression impossible");
        }
      }}
    ]);
  };

  const startEdit = (c) => {
    setEditingId(c.id_citoyen);
    setForm(c);
    setModalVisible(true);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.nom} {item.prenom}</Text>
        <Text style={styles.cin}>CIN: {item.numero_cin}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => startEdit(item)} style={styles.editBtn}>
          <Text style={styles.btnText}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => deleteCitoyen(item.id_citoyen)} style={styles.deleteBtn}>
          <Text style={styles.btnText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerActions}>
        <View style={styles.searchBar}>
          <TextInput 
            style={styles.input} 
            placeholder="Rechercher..." 
            value={search}
            onChangeText={setSearch}
          />
          <TouchableOpacity style={styles.searchButton} onPress={() => fetchCitoyens(search)}>
            <Text style={styles.searchButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity 
          style={[styles.exportBtn, exporting && { opacity: 0.5 }]} 
          onPress={exportPDF}
          disabled={exporting}
        >
          {exporting ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.btnText}>PDF 📄</Text>}
        </TouchableOpacity>
      </View>

      <FlatList
        data={citoyens}
        keyExtractor={(item, index) => item?.id_citoyen?.toString() || index.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={fetchCitoyens}
      />

      <TouchableOpacity style={styles.fab} onPress={() => { setEditingId(null); setForm(defaultForm); setModalVisible(true); }}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide">
        <ScrollView style={styles.modalContent}>
          <Text style={styles.modalTitle}>{editingId ? 'Modifier Citoyen' : 'Nouveau Citoyen'}</Text>
          <TextInput style={styles.formInput} placeholder="NOM" value={form.nom} onChangeText={t => setForm({...form, nom: t.toUpperCase()})} />
          <TextInput style={styles.formInput} placeholder="Prénom" value={form.prenom} onChangeText={t => setForm({...form, prenom: t})} />
          <TextInput style={styles.formInput} placeholder="Date Naissance (YYYY-MM-DD)" value={form.date_naissance} onChangeText={t => setForm({...form, date_naissance: t})} />
          <TextInput style={styles.formInput} placeholder="Lieu Naissance" value={form.lieu_naissance} onChangeText={t => setForm({...form, lieu_naissance: t})} />
          <TextInput style={styles.formInput} placeholder="CIN" value={form.numero_cin} onChangeText={t => setForm({...form, numero_cin: t})} />
          
          <View style={styles.switchRow}>
            <Text>Est vivant ?</Text>
            <Switch 
              value={form.est_vivant} 
              onValueChange={v => setForm({...form, est_vivant: v})} 
              trackColor={{ true: '#003366' }}
            />
          </View>

          <Text style={styles.label}>Sexe</Text>
          <View style={styles.genderRow}>
            {['M', 'F'].map(s => (
              <TouchableOpacity 
                key={s} 
                style={[styles.genderBtn, form.sexe === s && styles.genderBtnActive]}
                onPress={() => setForm({...form, sexe: s})}
              >
                <Text style={[styles.genderText, form.sexe === s && styles.genderTextActive]}>{s === 'M' ? 'Masculin' : 'Féminin'}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <Text style={styles.submitBtnText}>Enregistrer</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
            <Text style={styles.cancelBtnText}>Annuler</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  headerActions: { padding: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  searchBar: { flexDirection: 'row', marginBottom: 10 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 15, height: 45 },
  searchButton: { marginLeft: 10, backgroundColor: '#003366', borderRadius: 8, paddingHorizontal: 20, justifyContent: 'center' },
  searchButtonText: { color: '#fff', fontWeight: 'bold' },
  exportBtn: { backgroundColor: '#d32f2f', padding: 10, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold' },
  list: { padding: 15 },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 2 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  cin: { fontSize: 12, color: '#666', marginTop: 4 },
  actions: { flexDirection: 'row' },
  editBtn: { padding: 10 },
  deleteBtn: { padding: 10 },
  fab: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 30, backgroundColor: '#003366', justifyContent: 'center', alignItems: 'center', elevation: 5 },
  fabText: { color: '#fff', fontSize: 30, fontWeight: 'bold' },
  modalContent: { padding: 20 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#003366' },
  formInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 15 },
  label: { marginBottom: 10, fontWeight: 'bold', color: '#666' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingHorizontal: 5 },
  genderRow: { flexDirection: 'row', gap: 10, marginBottom: 25 },
  genderBtn: { flex: 1, padding: 12, borderWidth: 1, borderColor: '#003366', borderRadius: 8, alignItems: 'center' },
  genderBtnActive: { backgroundColor: '#003366' },
  genderText: { color: '#003366', fontWeight: 'bold' },
  genderTextActive: { color: '#fff' },
  submitBtn: { backgroundColor: '#003366', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  submitBtnText: { color: '#fff', fontWeight: 'bold' },
  cancelBtn: { padding: 15, alignItems: 'center' },
  cancelBtnText: { color: '#666' }
});
