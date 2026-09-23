import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Heart, Plus, ChevronRight } from 'lucide-react-native';
import { supabase, Category } from '@/lib/supabase';
import { Colors, Spacing, BorderRadius, Typography } from '@/lib/theme';
import { StarRating } from '@/components/StarRating';

type CategoryWithStats = Category & {
  entry_count: number;
  avg_rating: number | null;
};

export default function HomeScreen() {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    const { data: catData } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: true });

    if (catData) {
      const catsWithStats: CategoryWithStats[] = await Promise.all(
        catData.map(async (cat) => {
          const { count } = await supabase
            .from('entries')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', cat.id);

          const { data: avgData } = await supabase
            .from('entries')
            .select('rating')
            .eq('category_id', cat.id);

          const avg = avgData && avgData.length > 0
            ? avgData.reduce((sum, e) => sum + Number(e.rating), 0) / avgData.length
            : null;

          return { ...cat, entry_count: count ?? 0, avg_rating: avg };
        }),
      );
      setCategories(catsWithStats);
    }

    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const totalEntries = categories.reduce((sum, c) => sum + c.entry_count, 0);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
    >
      <View style={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <View style={styles.logoIcon}>
              <Heart size={20} color={Colors.text} fill={Colors.text} strokeWidth={0} />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.greeting}>Coisoteca</Text>
              <Text style={styles.subtitle}>Minha namorada pede e eu faço</Text>
            </View>
          </View>
          <View style={styles.statsBar}>
            <View style={styles.statPill}>
              <Text style={styles.statPillValue}>{categories.length}</Text>
              <Text style={styles.statPillLabel}>categorias</Text>
            </View>
            <View style={styles.statPill}>
              <Text style={styles.statPillValue}>{totalEntries}</Text>
              <Text style={styles.statPillLabel}>avaliações</Text>
            </View>
          </View>
        </View>

        {/* New Category Button */}
        <Pressable
          style={styles.newCategoryButton}
          onPress={() => router.push('/category/new')}
        >
          <Plus size={20} color={Colors.primary} strokeWidth={2.5} />
          <Text style={styles.newCategoryText}>Nova Categoria</Text>
        </Pressable>

        {/* Categories List */}
        {categories.length === 0 ? (
          <View style={styles.emptyCategories}>
            <Text style={styles.emptyEmoji}>📁</Text>
            <Text style={styles.emptyTitle}>Nenhuma categoria ainda</Text>
            <Text style={styles.emptySubtitle}>Toque em "Nova Categoria" para começar</Text>
          </View>
        ) : (
          <View style={styles.categoryList}>
            {categories.map((cat) => (
              <Pressable
                key={cat.id}
                style={[styles.categoryCard, { borderLeftColor: cat.color }]}
                onPress={() => router.push(`/category/${cat.id}`)}
              >
                <View style={styles.categoryCardLeft}>
                  <View style={[styles.categoryIconBox, { backgroundColor: cat.color + '22' }]}>
                    <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                  </View>
                  <View style={styles.categoryInfo}>
                    <Text style={styles.categoryName} numberOfLines={1}>{cat.name}</Text>
                    <Text style={styles.categoryCount}>
                      {cat.entry_count} {cat.entry_count === 1 ? 'avaliação' : 'avaliações'}
                    </Text>
                    {cat.avg_rating !== null && cat.entry_count > 0 ? (
                      <View style={styles.categoryRatingRow}>
                        <StarRating rating={cat.avg_rating} size={13} />
                        <Text style={styles.categoryAvg}>{cat.avg_rating.toFixed(1)}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
                <View style={styles.categoryCardRight}>
                  <Pressable
                    style={styles.addEntryButton}
                    onPress={() => router.push(`/entry/new?categoryId=${cat.id}`)}
                  >
                    <Plus size={18} color={Colors.primary} strokeWidth={2.5} />
                  </Pressable>
                  <ChevronRight size={20} color={Colors.textMuted} />
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
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
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  logoIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  greeting: {
    fontFamily: Typography.heading,
    fontSize: 24,
    color: Colors.text,
    marginBottom: 2,
  },
  subtitle: {
    fontFamily: Typography.body,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  statsBar: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  statPillValue: {
    fontFamily: Typography.headingSemi,
    fontSize: 15,
    color: Colors.text,
  },
  statPillLabel: {
    fontFamily: Typography.body,
    fontSize: 13,
    color: Colors.textMuted,
  },
  newCategoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  newCategoryText: {
    fontFamily: Typography.bodyMedium,
    fontSize: 15,
    color: Colors.primary,
  },
  categoryList: {
    gap: Spacing.sm,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderLeftWidth: 4,
  },
  categoryCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.md,
  },
  categoryIconBox: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryEmoji: {
    fontSize: 26,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontFamily: Typography.headingSemi,
    fontSize: 16,
    color: Colors.text,
    marginBottom: 2,
  },
  categoryCount: {
    fontFamily: Typography.body,
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  categoryRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  categoryAvg: {
    fontFamily: Typography.bodySemi,
    fontSize: 12,
    color: Colors.accent,
  },
  categoryCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  addEntryButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCategories: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  emptyEmoji: {
    fontSize: 48,
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
});
