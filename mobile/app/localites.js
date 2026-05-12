import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Modal, ScrollView, Alert } from 'react-native';
import api from '../services/api';

export default function Localites() {
  const [localites, setLocalites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ nom_commune: '', district: '', region: '', code_postal: '' });

  const fetchLocalites = async () => {
    setLoading(true);
    try {
      const res = await api.get('/localites');
      setLocalites(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLocalites(); }, []);

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await api.put(`/localites/${editingId}`, form);
      } else {
        await api.post('/localites', form);
      }
      setModalVisible(false);
      setEditingId(null);
      setForm({ nom_commune: '', district: '', region: '', code_postal: '' });
      fetchLocalites();
    } catch (e) {
      Alert.alert("Erreur", "Action impossible");
    }
  };

  const deleteLoc = (id) => {
    Alert.alert("Attention", "Supprimer cette localité ?", [
      { text: "Non" },
      { text: "Oui", onPress: async () => {
        await api.delete(`/localites/${id}`);
        fetchLocalites();
      }}
    ]);
  };

  const startEdit = (l) => {
    setEditingId(l.id_localite);
    setForm({ nom_commune: l.nom_commune, district: l.district, region: l.region, code_postal: l.code_postal });
    setModalVisible(true);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.commune}>{item.nom_commune}</Text>
        <Text style={styles.details}>{item.district} - {item.region}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => startEdit(item)} style={styles.btn}>
          <Text>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => deleteLoc(item.id_localite)} style={styles.btn}>
          <Text>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={localites}
        keyExtractor={(item, index) => item?.id_localite?.toString() || index.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        onRefresh={fetchLocalites}
        refreshing={loading}
      />

      <TouchableOpacity style={styles.fab} onPress={() => { setEditingId(null); setForm({nom_commune:'', district:'', region:'', code_postal:''}); setModalVisible(true); }}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="fade">
        <ScrollView style={styles.modal}>
          <Text style={styles.title}>{editingId ? 'Modifier' : 'Ajouter'} Localité</Text>
          <TextInput style={styles.input} placeholder="Commune" value={form.nom_commune} onChangeText={t => setForm({...form, nom_commune: t})} />
          <TextInput style={styles.input} placeholder="District" value={form.district} onChangeText={t => setForm({...form, district: t})} />
          <TextInput style={styles.input} placeholder="Région" value={form.region} onChangeText={t => setForm({...form, region: t})} />
          <TextInput style={styles.input} placeholder="Code Postal" value={form.code_postal} onChangeText={t => setForm({...form, code_postal: t})} />
          
          <TouchableOpacity style={styles.save} onPress={handleSubmit}>
            <Text style={{color:'#fff', fontWeight:'bold'}}>Enregistrer</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setModalVisible(false)} style={{marginTop: 20, alignItems:'center'}}>
            <Text>Annuler</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  list: { padding: 15 },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, flexDirection: 'row', alignItems: 'center', elevation: 2 },
  commune: { fontSize: 18, fontWeight: 'bold' },
  details: { color: '#666' },
  actions: { flexDirection: 'row' },
  btn: { padding: 10 },
  fab: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 30, backgroundColor: '#003366', justifyContent: 'center', alignItems: 'center', elevation: 5 },
  fabText: { color: '#fff', fontSize: 30, fontWeight: 'bold' },
  modal: { padding: 30 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, marginBottom: 15 },
  save: { backgroundColor: '#003366', padding: 15, borderRadius: 8, alignItems: 'center' }
});
