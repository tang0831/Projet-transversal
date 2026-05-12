import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#003366',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Bienvenue', headerShown: false }} />
      <Stack.Screen name="login" options={{ title: 'Connexion' }} />
      <Stack.Screen name="register" options={{ title: 'Inscription' }} />
      <Stack.Screen name="home" options={{ title: 'Tableau de Bord', headerShown: true }} />
      <Stack.Screen name="citoyens" options={{ title: 'Gestion des Citoyens' }} />
      <Stack.Screen name="actes" options={{ title: 'Registre des Actes' }} />
      <Stack.Screen name="localites" options={{ title: 'Localités' }} />
      <Stack.Screen name="forum" options={{ title: 'Forum de Discussion' }} />
      <Stack.Screen name="optimisation" options={{ title: 'Optimisation Logistique' }} />
    </Stack>
  );
}
