import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
  ScrollView,
  Platform,
  Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Pencil, Trash2, Calendar } from 'lucide-react-native';
import { supabase, Entry, Category } from '@/lib/supabase';
import { Colors, Spacing, BorderRadius, Typography } from '@/lib/theme';
import { StarRating } from '@/components/StarRating';

export default function EntryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [entry, setEntry] = useState<Entry | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const entryRes = await supabase.from('entries').select('*').eq('id', id).maybeSingle();
    if (entryRes.data) {
      setEntry(entryRes.data as Entry);
      const catRes = await supabase
        .from('categories')
        .select('*')
        .eq('id', entryRes.data.category_id)
        .maybeSingle();
      if (catRes.data) setCategory(catRes.data as Category);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = useCallback(() => {
    Alert.alert(
      'Excluir avaliação',
      'Tem certeza que quer apagar esta avaliação?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase.from('entries').delete().eq('id', id);
            if (error) {
              Alert.alert('Erro', 'Não foi possível excluir');
              return;
            }
            router.back();
          },
        },
      ],
    );
  }, [id, router]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!entry) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.emptyText}>Avaliação não encontrada</Text>
      </View>
    );
  }

  const dateStr = new Date(entry.created_at).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.text} />
        </Pressable>
        <View style={styles.headerActions}>
          <Pressable
            style={styles.iconButton}
            onPress={() => router.push(`/entry/new?id=${entry.id}`)}
          >
            <Pencil size={20} color={Colors.textMuted} />
          </Pressable>
          <Pressable style={styles.iconButton} onPress={handleDelete}>
            <Trash2 size={20} color={Colors.textMuted} />
          </Pressable>
        </View>
      </View>

{entry.photo_url ? (
  <View
    style={[
      styles.photoContainer,
      entry.photo_orientation === 'vertical'
        ? styles.photoContainerVertical
        : styles.photoContainerHorizontal,
    ]}
  >
    {Platform.OS === 'web' ? (
      <img
        src={entry.photo_url}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          borderRadius: 24,
        }}
      />
    ) : (
      <Image
        source={{ uri: entry.photo_url }}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 24,
        }}
        resizeMode="cover"
      />
    )}
  </View>
) : null}

      <View style={styles.content}>
        {category && (
          <Pressable
            style={[styles.categoryBadge, { backgroundColor: category.color + '22', borderColor: category.color }]}
            onPress={() => router.push(`/category/${category.id}`)}
          >
            <Text style={styles.categoryBadgeEmoji}>{category.emoji}</Text>
            <Text style={[styles.categoryBadgeText, { color: category.color }]}>{category.name}</Text>
          </Pressable>
        )}

        <Text style={styles.entryTitle}>{entry.title}</Text>

        <View style={styles.ratingSection}>
          <StarRating rating={Number(entry.rating)} size={36} />
          <Text style={styles.ratingValue}>{Number(entry.rating).toFixed(1)}</Text>
        </View>

        {entry.comment ? (
          <View style={styles.commentBox}>
            <Text style={styles.commentText}>{entry.comment}</Text>
          </View>
        ) : null}

        <View style={styles.dateRow}>
          <Calendar size={16} color={Colors.textMuted} />
          <Text style={styles.dateText}>{dateStr}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  emptyText: {
    fontFamily: Typography.body,
    fontSize: 16,
    color: Colors.textMuted,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  iconButton: {
    padding: Spacing.xs,
  },
  photoContainer: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
    backgroundColor: Colors.surfaceLight,
    alignSelf: 'center',
  },
  photoContainerHorizontal: {
    width: '100%',
    height: 300,
  },
  photoContainerVertical: {
    width: 320,
    height: 440,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  categoryBadgeEmoji: {
    fontSize: 16,
  },
  categoryBadgeText: {
    fontFamily: Typography.bodyMedium,
    fontSize: 13,
  },
  entryTitle: {
    fontFamily: Typography.heading,
    fontSize: 26,
    color: Colors.text,
    marginBottom: Spacing.md,
    lineHeight: 34,
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  ratingValue: {
    fontFamily: Typography.heading,
    fontSize: 30,
    color: Colors.accent,
  },
  commentBox: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  commentText: {
    fontFamily: Typography.body,
    fontSize: 16,
    color: Colors.text,
    lineHeight: 26,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  dateText: {
    fontFamily: Typography.body,
    fontSize: 14,
    color: Colors.textMuted,
  },
});
