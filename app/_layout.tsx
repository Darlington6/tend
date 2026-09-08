import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { migrateDbIfNeeded } from '../lib/db';
import { colors } from '../constants/theme';
import { SyncManager } from '../components/SyncManager';
import { PurchasesManager } from '../components/PurchasesManager';

export default function RootLayout() {
  return (
    <SQLiteProvider databaseName="tend-v2.db" onInit={migrateDbIfNeeded}>
      <SyncManager />
      <PurchasesManager />
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerShadowVisible: false,
          headerTintColor: colors.text,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen
          name="ritual/new"
          options={{ title: 'New Ritual', presentation: 'modal' }}
        />
        <Stack.Screen name="ritual/[id]" options={{ title: 'Ritual' }} />
        <Stack.Screen name="settings" options={{ title: 'Settings' }} />
        <Stack.Screen name="insights" options={{ title: 'Insights' }} />
      </Stack>
    </SQLiteProvider>
  );
}
