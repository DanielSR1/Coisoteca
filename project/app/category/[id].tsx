import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Image,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { ArrowLeft, Plus, Trash2, Pencil, Star } from 'lucide-react-native';
import { supabase, Entry, Category } from '@/lib/supabase';
import { Colors, Spacing, BorderRadius, Typography } from '@/lib/theme';
import { StarRating } from '@/components/StarRating';

type SortMode = 'recent' | 'rating_high' | 'rating_low';

export default function CategoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [category, setCategory] = useState<Category | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>('recent');

  const loadData = useCallback(async () => {
    const [catRes, entriesRes] = await Promise.all([
      supabase.from('categories').select('*').eq('id', id).maybeSingle(),
      supabase.from('entries').select('*').eq('category_id', id),
    ]);

    if (catRes.data) setCategory(catRes.data as Category);

    let sorted = entriesRes.data || [];
    if (sortMode === 'rating_high') {
      sorted = [...sorted].sort((a, b) => Number(b.rating) - Number(a.rating));
    } else if (sortMode === 'rating_low') {
      sorted = [...sorted].sort((a, b) => Number(a.rating) - Number(b.rating));
    } else {
      sorted = [...sorted].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    setEntries(sorted);

    setLoading(false);
    setRefreshing(false);
  }, [id, sortMode]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const handleDeleteCategory = useCallback(() => {
    Alert.alert(
      'Excluir categoria',
      'Isso vai apagar a categoria e todas as avaliações dentro dela. Tem certeza?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase.from('categories').delete().eq('id', id);
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

  const avgRating = entries.length > 0
    ? entries.reduce((sum, e) => sum + Number(e.rating), 0) / entries.length
    : 0;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { borderLeftColor: category?.color || Colors.primary }]}>
        <View style={styles.headerTop}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={Colors.text} />
          </Pressable>
          <View style={styles.headerActions}>
            <Pressable
              style={styles.iconButton}
              onPress={() => router.push(`/category/new?id=${id}&edit=true`)}
            >
              <Pencil size={20} color={Colors.textMuted} />
            </Pressable>
            <Pressable style={styles.iconButton} onPress={handleDeleteCategory}>
              <Trash2 size={20} color={Colors.textMuted} />
            </Pressable>
          </View>
        </View>

        <View style={styles.headerContent}>
          <Text style={styles.categoryEmoji}>{category?.emoji}</Text>
          <Text style={styles.categoryTitle}>{category?.name}</Text>
          <View style={styles.headerStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{entries.length}</Text>
              <Text style={styles.statLabel}>{entries.length === 1 ? 'item' : 'itens'}</Text>
            </View>
            {entries.length > 0 && (
              <>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <StarRating rating={avgRating} size={16} />
                  <Text style={styles.statLabel} style={[styles.statLabel, { marginTop: 4 }]}>
                    {avgRating.toFixed(1)} média
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>
      </View>

      {entries.length > 0 && (
        <View style={styles.sortRow}>
          {(['recent', 'rating_high', 'rating_low'] as SortMode[]).map((mode) => (
            <Pressable
              key={mode}
              style={[styles.sortButton, sortMode === mode && styles.sortButtonActive]}
              onPress={() => setSortMode(mode)}
            >
              <Text style={[styles.sortText, sortMode === mode && styles.sortTextActive]}>
                {mode === 'recent' ? 'Recentes' : mode === 'rating_high' ? 'Maior nota' : 'Menor nota'}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Pressable
            style={styles.entryCard}
            onPress={() => router.push(`/entry/${item.id}`)}
          >
            {item.photo_url ? (
              <View style={styles.entryPhotoContainer}>
                {Platform.OS === 'web' ? (
                  <img
                    src={item.photo_url}
                    style={{ width: 72, height: 72, borderRadius: 12, objectFit: 'cover', display: 'flex' }}
                  />
                ) : (
                  <Image source={{ uri: item.photo_url }} style={styles.entryPhoto} />
                )}
              </View>
            ) : null}
            <View style={styles.entryContent}>
              <View style={styles.entryTop}>
                <View style={styles.entryLeft}>
                  <Text style={styles.entryTitle} numberOfLines={1}>{item.title}</Text>
                  {item.comment ? (
                    <Text style={styles.entryComment} numberOfLines={2}>{item.comment}</Text>
                  ) : null}
                </View>
                <View style={styles.entryRatingBox}>
                  <Text style={styles.entryRatingNumber}>{Number(item.rating).toFixed(1)}</Text>
                  <Star size={14} color={Colors.accent} fill={Colors.accent} strokeWidth={0} />
                </View>
              </View>
              <View style={styles.entryBottom}>
                <StarRating rating={Number(item.rating)} size={16} />
                <Text style={styles.entryDate}>
                  {new Date(item.created_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </Text>
              </View>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>{category?.emoji}</Text>
            <Text style={styles.emptyTitle}>Nenhuma avaliação aqui ainda</Text>
            <Text style={styles.emptySubtitle}>Toque no botão abaixo para adicionar</Text>
          </View>
        }
      />

      <Pressable
        style={styles.fab}
        onPress={() => router.push(`/entry/new?categoryId=${id}`)}
      >
        <Plus size={26} color={Colors.text} strokeWidth={2.5} />
      </Pressable>
    </View>
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
  header: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    borderBottomColor: Colors.border,
    borderBottomWidth: 1,
    borderLeftWidth: 4,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  iconButton: {
    padding: Spacing.xs,
  },
  headerContent: {
    alignItems: 'center',
  },
  categoryEmoji: {
    fontSize: 48,
    marginBottom: Spacing.sm,
  },
  categoryTitle: {
    fontFamily: Typography.heading,
    fontSize: 24,
    color: Colors.text,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontFamily: Typography.headingSemi,
    fontSize: 18,
    color: Colors.text,
  },
  statLabel: {
    fontFamily: Typography.body,
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.border,
  },
  sortRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  sortButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
  },
  sortButtonActive: {
    backgroundColor: Colors.primary,
  },
  sortText: {
    fontFamily: Typography.bodyMedium,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  sortTextActive: {
    color: Colors.text,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 100,
  },
  entryCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  entryPhotoContainer: {
    marginRight: Spacing.md,
  },
  entryPhoto: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.md,
  },
  entryContent: {
    flex: 1,
    flexDirection: 'column',
  },
  entryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  entryLeft: {
    flex: 1,
    marginRight: Spacing.md,
  },
  entryTitle: {
    fontFamily: Typography.headingSemi,
    fontSize: 16,
    color: Colors.text,
    marginBottom: 4,
  },
  entryComment: {
    fontFamily: Typography.body,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  entryRatingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  entryRatingNumber: {
    fontFamily: Typography.headingSemi,
    fontSize: 15,
    color: Colors.accent,
  },
  entryBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  entryDate: {
    fontFamily: Typography.body,
    fontSize: 12,
    color: Colors.textMuted,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontFamily: Typography.headingSemi,
    fontSize: 18,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  emptySubtitle: {
    fontFamily: Typography.body,
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: Spacing.lg,
    right: Spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
