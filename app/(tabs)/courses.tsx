import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Button } from "../../components/ui/Button";
import { COLORS, HOLE_COUNTS } from "../../constants";
import type { Course } from "../../types";

export default function CoursesScreen() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newHoles, setNewHoles] = useState(8);
  const [adding, setAdding] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { listCourses } = await import("../../db/repositories/course");
      const { getDb } = await import("../../db/index");
      const db = await getDb();
      setCourses(await listCourses(db));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setAdding(true);
    try {
      const { insertCourse } = await import("../../db/repositories/course");
      const { getDb } = await import("../../db/index");
      const db = await getDb();
      const id = `course-${Date.now()}`;
      await insertCourse(db, id, newName.trim(), newHoles);
      setNewName("");
      await refresh();
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = (course: Course) => {
    Alert.alert("コースを削除", `${course.name} を削除しますか？`, [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除",
        style: "destructive",
        onPress: async () => {
          const { deleteCourse } = await import("../../db/repositories/course");
          const { getDb } = await import("../../db/index");
          const db = await getDb();
          await deleteCourse(db, course.id);
          refresh();
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>コース管理</Text>

      <View style={styles.addForm}>
        <TextInput
          style={styles.input}
          placeholder="コース名"
          placeholderTextColor={COLORS.textMuted}
          value={newName}
          onChangeText={setNewName}
        />
        <View style={styles.holeSelector}>
          {HOLE_COUNTS.map((n) => (
            <Pressable
              key={n}
              onPress={() => setNewHoles(n)}
              style={[styles.holeBtn, newHoles === n && styles.holeBtnActive]}
            >
              <Text style={[styles.holeLabel, newHoles === n && styles.holeLabelActive]}>
                {n}H
              </Text>
            </Pressable>
          ))}
        </View>
        <Button variant="primary" onPress={handleAdd} disabled={!newName.trim() || adding}>
          追加
        </Button>
      </View>

      {loading ? (
        <Text style={styles.empty}>読み込み中...</Text>
      ) : courses.length === 0 ? (
        <Text style={styles.empty}>コースが登録されていません</Text>
      ) : (
        <View style={styles.list}>
          {courses.map((c) => (
            <View key={c.id} style={styles.courseRow}>
              <View style={styles.courseInfo}>
                <Text style={styles.courseName}>{c.name}</Text>
                <Text style={styles.courseHoles}>{c.holeCount} ホール</Text>
              </View>
              <Pressable onPress={() => handleDelete(c)}>
                <Text style={styles.deleteBtn}>削除</Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, gap: 20 },
  title: { fontSize: 22, fontWeight: "800", color: COLORS.text },
  addForm: { gap: 12 },
  input: {
    padding: 14,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontSize: 16,
    color: COLORS.text,
  },
  holeSelector: { flexDirection: "row", gap: 12 },
  holeBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  holeBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  holeLabel: { fontSize: 16, fontWeight: "600", color: COLORS.text },
  holeLabelActive: { color: "#fff" },
  list: { gap: 8 },
  courseRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  courseInfo: { gap: 2 },
  courseName: { fontSize: 16, fontWeight: "600", color: COLORS.text },
  courseHoles: { fontSize: 13, color: COLORS.textSecondary },
  deleteBtn: { fontSize: 14, color: COLORS.danger },
  empty: { fontSize: 14, color: COLORS.textMuted, textAlign: "center", paddingVertical: 40 },
});
