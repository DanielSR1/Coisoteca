import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Plus, Star, ChevronRight, Heart } from 'lucide-react-native';
import { supabase, Category } from '@/lib/supabase';
import { Colors, Spacing, BorderRadius, Typography } from '@/lib/theme';
import { StarRating } from '@/components/StarRating';

export default function AddScreen() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    const { data } = await supabase.from('categories').select('*').order('created_at');
    setCategories(data || []);
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

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
    >
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoIcon}>
            <Heart size={20} color={Colors.text} fill={Colors.text} strokeWidth={0} />
          </View>
          <View>
            <Text style={styles.pageTitle}>Adicionar</Text>
            <Text style={styles.pageSubtitle}>O que você quer avaliar hoje?</Text>
          </View>
        </View>
      </View>

      <Pressable
        style={styles.bigButton}
        onPress={() => router.push('/entry/new')}
      >
        <View style={styles.bigButtonIcon}>
          <Star size={28} color={Colors.text} fill={Colors.text} strokeWidth={0} />
        </View>
        <View style={styles.bigButtonInfo}>
          <Text style={styles.bigButtonTitle}>Nova Avaliação</Text>
          <Text style={styles.bigButtonSubtitle}>Dê nota, comente e adicione foto</Text>
        </View>
        <ChevronRight size={22} color={Colors.textMuted} />
      </Pressable>

      <Pressable
        style={[styles.bigButton, { borderLeftColor: Colors.accent }]}
        onPress={() => router.push('/category/new')}
      >
        <View style={[styles.bigButtonIcon, { backgroundColor: Colors.accent + '22' }]}>
          <Plus size={28} color={Colors.accent} strokeWidth={2.5} />
        </View>
        <View style={styles.bigButtonInfo}>
          <Text style={styles.bigButtonTitle}>Nova Categoria</Text>
          <Text style={styles.bigButtonSubtitle}>Crie uma nova coleção de avaliações</Text>
        </View>
        <ChevronRight size={22} color={Colors.textMuted} />
      </Pressable>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Escolha uma categoria</Text>
      </View>

      {categories.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>📂</Text>
          <Text style={styles.emptyTitle}>Sem categorias</Text>
          <Text style={styles.emptySubtitle}>Crie uma categoria para começar</Text>
        </View>
      ) : (
        <View style={styles.categoryList}>
          {categories.map((cat) => (
            <Pressable
              key={cat.id}
              style={[styles.categoryItem, { borderLeftColor: cat.color }]}
              onPress={() => router.push(`/entry/new?categoryId=${cat.id}`)}
            >
              <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName} numberOfLines={1}>{cat.name}</Text>
                <Text style={styles.categoryHint}>Adicionar avaliação</Text>
              </View>
              <ChevronRight size={20} color={Colors.textMuted} />
            </Pressable>
          ))}
        </View>
      )}
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
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  logoIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageTitle: {
    fontFamily: Typography.heading,
    fontSize: 24,
    color: Colors.text,
    marginBottom: 2,
  },
  pageSubtitle: {
    fontFamily: Typography.body,
    fontSize: 15,
    color: Colors.textSecondary,
  },
  bigButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  bigButtonIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary + '22',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  bigButtonInfo: {
    flex: 1,
  },
  bigButtonTitle: {
    fontFamily: Typography.headingSemi,
    fontSize: 17,
    color: Colors.text,
    marginBottom: 2,
  },
  bigButtonSubtitle: {
    fontFamily: Typography.body,
    fontSize: 13,
    color: Colors.textMuted,
  },
  sectionHeader: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontFamily: Typography.headingSemi,
    fontSize: 18,
    color: Colors.text,
  },
  categoryList: {
    gap: Spacing.sm,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderLeftWidth: 3,
  },
  categoryEmoji: {
    fontSize: 28,
    marginRight: Spacing.md,
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
  categoryHint: {
    fontFamily: Typography.body,
    fontSize: 13,
    color: Colors.textMuted,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
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
  },
});
