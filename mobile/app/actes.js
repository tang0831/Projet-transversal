import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Modal, ScrollView, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import api from '../services/api';
import { SyncService } from '../services/SyncService';

export default function Actes() {
  const [actes, setActes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ type_acte: 'NAISSANCE', date_acte: '', numero_registre: '', id_citoyen: '' });
  const [syncQueueSize, setSyncQueueSize] = useState(0);

  const fetchActes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/actes');
      setActes(res.data);
      // Tentative de synchro auto au chargement
      checkAndProcessSync();
    } catch (e) {
      console.log('[Actes] Mode hors-ligne activé (affichage local seulement)');
    } finally {
      setLoading(false);
      updateQueueSize();
    }
  };

  const updateQueueSize = async () => {
    const queue = await SyncService.getQueue();
    setSyncQueueSize(queue.length);
  };

  const checkAndProcessSync = async () => {
    const success = await SyncService.processQueue();
    if (success) updateQueueSize();
  };

  useEffect(() => { fetchActes(); }, []);

  const exportPDF = async () => {
    setExporting(true);
    try {
      const filename = 'liste_actes.pdf';
      const fileUri = `${FileSystem.documentDirectory}${filename}`;
      const downloadUrl = `${api.defaults.baseURL}/actes/export/pdf`;
      
      const downloadRes = await FileSystem.downloadAsync(downloadUrl, fileUri);
      
      if (downloadRes.status === 200) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert("Erreur", "Impossible de générer le PDF");
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Erreur", "L'export a échoué");
    } finally {
      setExporting(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await api.put(`/actes/${editingId}`, form);
      } else {
        try {
          await api.post('/actes', form);
          Alert.alert("Succès", "Acte enregistré en ligne");
        } catch (netError) {
          // BASCULE EN MODE OFFLINE
          console.log('[Actes] Échec réseau, passage en mode hors-ligne');
          await SyncService.enqueue('/actes', 'POST', form);
          Alert.alert("Mode Hors-ligne", "Pas de réseau. L'acte a été stocké localement et sera synchronisé automatiquement dès le retour de la connexion.");
        }
      }
      setModalVisible(false);
      setEditingId(null);
      setForm({ type_acte: 'NAISSANCE', date_acte: '', numero_registre: '', id_citoyen: '' });
      fetchActes();
    } catch (e) {
      console.error(e);
      Alert.alert("Erreur", "Enregistrement impossible.");
    }
  };

  const deleteActe = (id) => {
    Alert.alert("Confirmation", "Supprimer cet acte ?", [
      { text: "Non" },
      { text: "Oui", style: 'destructive', onPress: async () => {
        await api.delete(`/actes/${id}`);
        fetchActes();
      }}
    ]);
  };

  const startEdit = (a) => {
    setEditingId(a.id_acte);
    setForm(a);
    setModalVisible(true);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.type}>{item.type_acte}</Text>
        <Text style={styles.info}>Date: {item.date_acte} • Registre: {item.numero_registre}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => startEdit(item)} style={styles.btn}>
          <Text>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => deleteActe(item.id_acte)} style={styles.btn}>
          <Text>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerActions}>
        <TouchableOpacity 
          style={[styles.exportBtn, exporting && { opacity: 0.5 }]} 
          onPress={exportPDF}
          disabled={exporting}
        >
          {exporting ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.exportBtnText}>Exporter la liste en PDF 📄</Text>}
        </TouchableOpacity>

        {syncQueueSize > 0 && (
          <TouchableOpacity style={styles.syncBanner} onPress={checkAndProcessSync}>
            <Text style={styles.syncText}>⏳ {syncQueueSize} acte(s) en attente de synchro. Tapotez pour réessayer.</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={actes}
        keyExtractor={(item, index) => item?.id_acte?.toString() || index.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        onRefresh={fetchActes}
        refreshing={loading}
      />

      <TouchableOpacity style={styles.fab} onPress={() => { setEditingId(null); setForm({type_acte:'NAISSANCE', date_acte:'', numero_registre:'', id_citoyen:''}); setModalVisible(true); }}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide">
        <ScrollView style={styles.modal}>
          <Text style={styles.title}>{editingId ? 'Modifier' : 'Indexer'} un Acte</Text>
          
          <Text style={styles.label}>Type d'acte</Text>
          <View style={styles.pickerContainer}>
            {['NAISSANCE', 'MARIAGE', 'DECES'].map(type => (
              <TouchableOpacity 
                key={type} 
                style={[styles.typeOption, form.type_acte === type && styles.typeSelected]}
                onPress={() => setForm({...form, type_acte: type})}
              >
                <Text style={[styles.typeText, form.type_acte === type && styles.typeTextSelected]}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput style={styles.input} placeholder="Date (YYYY-MM-DD)" value={form.date_acte} onChangeText={t => setForm({...form, date_acte: t})} />
          <TextInput style={styles.input} placeholder="Numéro Registre" value={form.numero_registre} onChangeText={t => setForm({...form, numero_registre: t})} />
          {!editingId && <TextInput style={styles.input} placeholder="ID Citoyen" value={form.id_citoyen} onChangeText={t => setForm({...form, id_citoyen: t})} />}
          
          <TouchableOpacity style={styles.save} onPress={handleSubmit}>
            <Text style={{color:'#fff', fontWeight:'bold'}}>Enregistrer l'acte</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setModalVisible(false)} style={{marginTop: 20, alignItems:'center'}}>
            <Text>Fermer</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  headerActions: { padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  exportBtn: { backgroundColor: '#d32f2f', padding: 12, borderRadius: 8, alignItems: 'center' },
  exportBtnText: { color: '#fff', fontWeight: 'bold' },
  syncBanner: { backgroundColor: '#fff3cd', padding: 10, borderRadius: 8, marginTop: 10, borderWidth: 1, borderColor: '#ffeeba', alignItems: 'center' },
  syncText: { color: '#856404', fontSize: 12, fontWeight: 'bold' },
  list: { padding: 15 },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, flexDirection: 'row', alignItems: 'center', elevation: 2 },
  type: { fontSize: 16, fontWeight: 'bold', color: '#003366' },
  info: { fontSize: 12, color: '#666', marginTop: 4 },
  actions: { flexDirection: 'row' },
  btn: { padding: 10 },
  fab: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 30, backgroundColor: '#003366', justifyContent: 'center', alignItems: 'center', elevation: 5 },
  fabText: { color: '#fff', fontSize: 30, fontWeight: 'bold' },
  modal: { padding: 25 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 25 },
  label: { marginBottom: 10, fontWeight: 'bold' },
  pickerContainer: { flexDirection: 'row', marginBottom: 20 },
  typeOption: { flex: 1, padding: 10, borderWidth: 1, borderColor: '#ddd', alignItems: 'center', borderRadius: 5, marginRight: 5 },
  typeSelected: { backgroundColor: '#003366', borderColor: '#003366' },
  typeText: { fontSize: 12 },
  typeTextSelected: { color: '#fff' },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, marginBottom: 15 },
  save: { backgroundColor: '#003366', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 }
});
