import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';

const { width } = Dimensions.get('window');

export default function Welcome() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.topDecoration}>
        <View style={[styles.stripe, { backgroundColor: '#FF0000', width: width * 0.3 }]} />
        <View style={[styles.stripe, { backgroundColor: '#FFFFFF', width: width * 0.3 }]} />
        <View style={[styles.stripe, { backgroundColor: '#007E33', width: width * 0.4 }]} />
      </View>

      <View style={styles.main}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>🏛️</Text>
          </View>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>VISION 2035</Text>
          <Text style={styles.subtitle}>E-Gouvernance & État Civil</Text>
          <View style={styles.separator} />
          <Text style={styles.description}>
            Accédez aux services citoyens de la République de Madagascar en un clic.
          </Text>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={() => router.push('/login')}
          >
            <Text style={styles.primaryButtonText}>Se Connecter</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={() => router.push('/register')}
          >
            <Text style={styles.secondaryButtonText}>Créer un compte</Text>
          </TouchableOpacity>
          
          <Text style={styles.versionText}>v1.0.0 - République de Madagascar</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topDecoration: {
    flexDirection: 'row',
    height: 8,
    width: '100%',
  },
  stripe: {
    height: '100%',
  },
  main: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: 'space-between',
    paddingVertical: 60,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#003366',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  logoEmoji: {
    fontSize: 60,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: '#003366',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#475569',
    marginTop: 5,
    textTransform: 'uppercase',
  },
  separator: {
    width: 60,
    height: 4,
    backgroundColor: '#FF0000',
    marginTop: 20,
    borderRadius: 2,
  },
  description: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  footer: {
    width: '100%',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#003366',
    width: '100%',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#003366',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 15,
    borderWidth: 2,
    borderColor: '#003366',
  },
  secondaryButtonText: {
    color: '#003366',
    fontSize: 17,
    fontWeight: 'bold',
  },
  versionText: {
    marginTop: 25,
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
});
