import { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import api from "../services/api";

export default function Optimisation() {
  const [budget, setBudget] = useState("100");
  const [items, setItems] = useState([
    { name: "Agent Nord", cost: 30, impact: 50 },
    { name: "Agent Sud", cost: 40, impact: 70 },
    { name: "Agent Est", cost: 50, impact: 90 },
    { name: "Agent Ouest", cost: 20, impact: 30 },
  ]);
  const [result, setResult] = useState(null);

  const runOptimization = async () => {
    try {
      const weights = items.map((i) => i.cost).join(",");
      const values = items.map((i) => i.impact).join(",");
      const res = await api.get(
        `/admin/optimize?capacity=${budget}&weights=${weights}&values=${values}`,
      );
      setResult(res.data);
    } catch (e) {
      Alert.alert("Erreur", "Impossible de calculer l'optimisation");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Optimisation Logistique</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Budget Maximum (Capacité)</Text>
        <TextInput
          style={styles.input}
          value={budget}
          onChangeText={setBudget}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Agents Disponibles</Text>
        {items.map((item, index) => (
          <View key={index} style={styles.itemRow}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemValues}>
              Coût: {item.cost} | Impact: {item.impact}
            </Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.runBtn} onPress={runOptimization}>
        <Text style={styles.runBtnText}>Calculer l'impact maximum</Text>
      </TouchableOpacity>

      {result && (
        <View style={styles.resultBox}>
          <Text style={styles.resultTitle}>Résultat de l'Optimisation</Text>
          <Text style={styles.resultVal}>
            Impact Total Max: {result.max_impact}
          </Text>
          <Text style={styles.selectedTitle}>Agents sélectionnés :</Text>
          {result.selected_indices.map((idx) => (
            <Text key={idx} style={styles.selectedItem}>
              ✅ {items[idx].name}
            </Text>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  header: { padding: 25, backgroundColor: "#003366" },
  title: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  desc: { color: "#adb5bd", fontSize: 12, marginTop: 5 },
  section: { padding: 20 },
  label: { fontWeight: "bold", marginBottom: 10, color: "#495057" },
  input: {
    borderWidth: 1,
    borderColor: "#dee2e6",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  itemRow: {
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#003366",
    elevation: 1,
  },
  itemName: { fontWeight: "bold", fontSize: 16 },
  itemValues: { fontSize: 12, color: "#6c757d", marginTop: 5 },
  runBtn: {
    margin: 20,
    backgroundColor: "#003366",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
  },
  runBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  resultBox: {
    margin: 20,
    padding: 20,
    backgroundColor: "#e7f5ff",
    borderRadius: 15,
    borderDashed: 1,
    borderColor: "#003366",
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#003366",
    marginBottom: 10,
  },
  resultVal: { fontSize: 16, fontWeight: "bold", color: "#003366" },
  selectedTitle: { marginTop: 15, fontWeight: "bold", fontSize: 14 },
  selectedItem: { marginTop: 5, color: "#003366" },
});
