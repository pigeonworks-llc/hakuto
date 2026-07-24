import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SQLiteProvider } from "expo-sqlite";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ErrorBoundary } from "../components/ErrorBoundary";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SQLiteProvider databaseName="hakuto.db" onInit={async (db) => {
        const { SCHEMA } = await import("../db/schema");
        await db.execAsync(SCHEMA);
        await db.execAsync("PRAGMA journal_mode = WAL;");
      }}>
        <StatusBar style="auto" />
        <ErrorBoundary>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="round/new" options={{ presentation: "modal", animation: "slide_from_bottom" }} />
            <Stack.Screen name="round/[id]" options={{ animation: "slide_from_right" }} />
            <Stack.Screen name="ocr/scan" options={{ presentation: "modal", animation: "slide_from_bottom" }} />
            <Stack.Screen name="ocr/confirm" options={{ presentation: "modal", animation: "slide_from_bottom" }} />
          </Stack>
        </ErrorBoundary>
      </SQLiteProvider>
    </GestureHandlerRootView>
  );
}
