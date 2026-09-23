import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Check } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { Colors, Spacing, BorderRadius, Typography, CategoryColors, EmojiGroups } from '@/lib/theme';

export default function CategoryFormScreen() {
  const { id, edit } = useLocalSearchParams<{ id?: string; edit?: string }>();
  const router = useRouter();
  const isEditing = edit === 'true' && !!id;

  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('⭐');
  const [color, setColor] = useState(CategoryColors[0]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEditing);

  useEffect(() => {
    if (!isEditing || !id) return;
    (async () => {
      const { data } = await supabase.from('categories').select('*').eq('id', id).maybeSingle();
      if (data) {
        setName(data.name);
        setEmoji(data.emoji);
        setColor(data.color);
      }
      setLoading(false);
    })();
  }, [id, isEditing]);

  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'Dê um nome à categoria');
      return;
    }
    setSaving(true);
    if (isEditing && id) {
      const { error } = await supabase
        .from('categories')
        .update({ name: name.trim(), emoji, color })
        .eq('id', id);
      setSaving(false);
      if (error) {
        Alert.alert('Erro', 'Não foi possível salvar');
        return;
      }
} else {
  const { error } = await supabase.from('categories').insert({
    name: name.trim(),
    emoji,
    color,
  });

  setSaving(false);

  if (error) {
    console.log('ERRO SUPABASE:', error);
    Alert.alert('Erro', error.message);
    return;
  }

    }
    router.back();
  }, [name, emoji, color, isEditing, id, router]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Editar Categoria' : 'Nova Categoria'}
        </Text>
        <Pressable style={styles.saveButton} onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <Check size={22} color={Colors.primary} />
          )}
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={[styles.previewCard, { borderLeftColor: color }]}>
          <Text style={styles.previewEmoji}>{emoji}</Text>
          <Text style={styles.previewName} numberOfLines={1}>{name || 'Nome da categoria'}</Text>
          <Text style={styles.previewCount}>0 avaliações</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Nome</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Ex: Restaurantes que fui"
            placeholderTextColor={Colors.textMuted}
            maxLength={50}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Escolha um ícone</Text>
          <View style={styles.emojiContainer}>
            <ScrollView
  style={styles.emojiScroll}
  contentContainerStyle={styles.emojiScrollContent}
  nestedScrollEnabled={true}
  showsVerticalScrollIndicator={true}
>
              {EmojiGroups.map((group) => (
                <View key={group.label} style={styles.emojiGroup}>
                  <Text style={styles.emojiGroupLabel}>{group.label}</Text>
                  <View style={styles.emojiGrid}>
                    {group.emojis.map((e) => (
                      <Pressable
                        key={e}
                        style={[
                          styles.emojiOption,
                          emoji === e && styles.emojiSelected,
                        ]}
                        onPress={() => setEmoji(e)}
                      >
                        <Text style={styles.emojiText}>{e}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Escolha uma cor</Text>
          <View style={styles.colorRow}>
            {CategoryColors.map((c) => (
              <Pressable
                key={c}
                style={[
                  styles.colorOption,
                  { backgroundColor: c },
                  color === c && styles.colorSelected,
                ]}
                onPress={() => setColor(c)}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomColor: Colors.border,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    fontFamily: Typography.headingSemi,
    fontSize: 17,
    color: Colors.text,
  },
  saveButton: {
    padding: Spacing.xs,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  previewCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.xl,
    borderLeftWidth: 4,
  },
  previewEmoji: {
    fontSize: 56,
    marginBottom: Spacing.sm,
  },
  previewName: {
    fontFamily: Typography.headingSemi,
    fontSize: 18,
    color: Colors.text,
    marginBottom: 4,
  },
  previewCount: {
    fontFamily: Typography.body,
    fontSize: 13,
    color: Colors.textMuted,
  },
  field: {
    marginBottom: Spacing.lg,
  },
  fieldLabel: {
    fontFamily: Typography.headingSemi,
    fontSize: 15,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontFamily: Typography.body,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emojiContainer: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  emojiScroll: {
    height: 280,
  },
  emojiScrollContent: {
    padding: Spacing.md,
  },
  emojiGroup: {
    marginBottom: Spacing.md,
  },
  emojiGroupLabel: {
    fontFamily: Typography.bodyMedium,
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  emojiOption: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emojiSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '15',
  },
  emojiText: {
    fontSize: 22,
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorSelected: {
    borderColor: Colors.text,
  },
});
