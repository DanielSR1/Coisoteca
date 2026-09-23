import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Check, Camera, X, RectangleHorizontal, RectangleVertical, ChevronDown, ChevronUp } from 'lucide-react-native';
import { supabase, Category } from '@/lib/supabase';
import { Colors, Spacing, BorderRadius, Typography } from '@/lib/theme';
import { StarRating } from '@/components/StarRating';

type PhotoOrientation = 'horizontal' | 'vertical';

export default function EntryFormScreen() {
  const { id, categoryId } = useLocalSearchParams<{ id?: string; categoryId?: string }>();
  const router = useRouter();
  const isEditing = !!id;

  const [title, setTitle] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoOrientation, setPhotoOrientation] = useState<PhotoOrientation>('horizontal');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(categoryId || '');
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const catRes = await supabase.from('categories').select('*').order('name');
      if (catRes.data) setCategories(catRes.data as Category[]);

      if (isEditing && id) {
        const entryRes = await supabase.from('entries').select('*').eq('id', id).maybeSingle();
        if (entryRes.data) {
          setTitle(entryRes.data.title);
          setRating(Number(entryRes.data.rating));
          setComment(entryRes.data.comment || '');
          setPhotoUrl(entryRes.data.photo_url);
          setPhotoOrientation((entryRes.data.photo_orientation as PhotoOrientation) || 'horizontal');
          setSelectedCategoryId(entryRes.data.category_id);
        }
      }

      if (!isEditing && categoryId) {
        setSelectedCategoryId(categoryId);
      } else if (!isEditing && catRes.data && catRes.data.length > 0) {
        setSelectedCategoryId(catRes.data[0].id);
      }

      setLoading(false);
    })();
  }, [id, categoryId, isEditing]);

  const handleSave = useCallback(async () => {
    if (!title.trim()) {
      Alert.alert('Erro', 'Dê um título à sua avaliação');
      return;
    }
    if (!selectedCategoryId) {
      Alert.alert('Erro', 'Escolha uma categoria');
      return;
    }
    setSaving(true);

    const payload = {
      title: title.trim(),
      rating,
      comment: comment.trim() || null,
      photo_url: photoUrl,
      photo_orientation: photoOrientation,
      category_id: selectedCategoryId,
      updated_at: new Date().toISOString(),
    };

    if (isEditing) {
      const { error } = await supabase.from('entries').update(payload).eq('id', id!);
      if (error) {
        setSaving(false);
        Alert.alert('Erro', 'Não foi possível salvar');
        return;
      }
    } else {
      const { error } = await supabase.from('entries').insert(payload);
      if (error) {
        setSaving(false);
        Alert.alert('Erro', 'Não foi possível salvar');
        return;
      }
    }

    setSaving(false);
    router.back();
  }, [title, rating, comment, photoUrl, photoOrientation, selectedCategoryId, isEditing, id, router]);

const pickImage = useCallback(async () => {
  if (Platform.OS === 'web') {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = (e: any) => {
      const file = e.target.files?.[0];

      if (!file) return;

      const reader = new FileReader();

      reader.onload = () => {
        setPhotoUrl(reader.result as string);
      };

      reader.readAsDataURL(file);
    };

    input.click();
    return;
  }

  const permission =
    await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    Alert.alert(
      'Permissão necessária',
      'Precisamos de acesso às suas fotos para escolher uma imagem.'
    );
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    quality: 0.8,
  });

  if (!result.canceled) {
    setPhotoUrl(result.assets[0].uri);
  }
}, []);

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
          {isEditing ? 'Editar Avaliação' : 'Nova Avaliação'}
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
        {photoUrl ? (
          <View style={styles.photoPreviewContainer}>
            <View
              style={[
                styles.photoPreview,
                photoOrientation === 'vertical' ? styles.photoPreviewVertical : styles.photoPreviewHorizontal,
              ]}
            >
<Image
  source={{ uri: photoUrl }}
  style={{
    width: '100%',
    height: '100%',
    borderRadius: 16,
  }}
  resizeMode="cover"
/>
            </View>
            <View style={styles.photoControls}>
              <View style={styles.orientationRow}>
                <Pressable
                  style={[
                    styles.orientationButton,
                    photoOrientation === 'horizontal' && styles.orientationButtonActive,
                  ]}
                  onPress={() => setPhotoOrientation('horizontal')}
                >
                  <RectangleHorizontal size={18} color={photoOrientation === 'horizontal' ? Colors.text : Colors.textMuted} />
                  <Text
                    style={[
                      styles.orientationText,
                      photoOrientation === 'horizontal' && styles.orientationTextActive,
                    ]}
                  >
                    Horizontal
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.orientationButton,
                    photoOrientation === 'vertical' && styles.orientationButtonActive,
                  ]}
                  onPress={() => setPhotoOrientation('vertical')}
                >
                  <RectangleVertical size={18} color={photoOrientation === 'vertical' ? Colors.text : Colors.textMuted} />
                  <Text
                    style={[
                      styles.orientationText,
                      photoOrientation === 'vertical' && styles.orientationTextActive,
                    ]}
                  >
                    Vertical
                  </Text>
                </Pressable>
              </View>
              <Pressable style={styles.removePhotoButton} onPress={() => setPhotoUrl(null)}>
                <X size={18} color={Colors.text} />
                <Text style={styles.removePhotoText}>Remover</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable style={styles.addPhotoButton} onPress={pickImage}>
            <Camera size={28} color={Colors.textMuted} />
            <Text style={styles.addPhotoText}>Adicionar foto</Text>
          </Pressable>
        )}

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Título</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Ex: Pizza Margherita do Giovanni"
            placeholderTextColor={Colors.textMuted}
            maxLength={100}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Categoria</Text>
          {categories.length === 0 ? (
            <Pressable
              style={styles.noCategoryBox}
              onPress={() => router.push('/category/new')}
            >
              <Text style={styles.noCategoryText}>
                Crie uma categoria primeiro
              </Text>
            </Pressable>
          ) : (
            <View>
              <Pressable
                style={styles.categoryDropdown}
                onPress={() => setCategoryDropdownOpen((v) => !v)}
              >
                {(() => {
                  const selected = categories.find((c) => c.id === selectedCategoryId);
                  return (
                    <>
                      <View style={styles.categoryDropdownLeft}>
                        {selected ? (
                          <>
                            <Text style={styles.categoryDropdownEmoji}>{selected.emoji}</Text>
                            <Text style={styles.categoryDropdownText} numberOfLines={1}>
                              {selected.name}
                            </Text>
                          </>
                        ) : (
                          <Text style={styles.categoryDropdownPlaceholder}>Selecione uma categoria</Text>
                        )}
                      </View>
                      {categoryDropdownOpen ? (
                        <ChevronUp size={20} color={Colors.textMuted} />
                      ) : (
                        <ChevronDown size={20} color={Colors.textMuted} />
                      )}
                    </>
                  );
                })()}
              </Pressable>

              {categoryDropdownOpen && (
                <View style={styles.categoryDropdownList}>
                  {categories.map((cat) => (
                    <Pressable
                      key={cat.id}
                      style={[
                        styles.categoryDropdownItem,
                        selectedCategoryId === cat.id && { backgroundColor: cat.color + '18' },
                      ]}
                      onPress={() => {
                        setSelectedCategoryId(cat.id);
                        setCategoryDropdownOpen(false);
                      }}
                    >
                      <View style={[styles.categoryDropdownItemColor, { backgroundColor: cat.color }]} />
                      <Text style={styles.categoryDropdownItemEmoji}>{cat.emoji}</Text>
                      <Text
                        style={[
                          styles.categoryDropdownItemText,
                          selectedCategoryId === cat.id && { color: cat.color },
                        ]}
                        numberOfLines={1}
                      >
                        {cat.name}
                      </Text>
                      {selectedCategoryId === cat.id && (
                        <Check size={18} color={cat.color} strokeWidth={2.5} />
                      )}
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Nota</Text>
          <View style={styles.ratingContainer}>
            <StarRating
              rating={rating}
              size={44}
              editable
              onRatingChange={setRating}
            />
            <Text style={styles.ratingValue}>{rating.toFixed(1)}</Text>
          </View>
          <Text style={styles.ratingHint}>Arraste pelas estrelas para escolher a nota (de 0,5 em 0,5)</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Comentário</Text>
          <TextInput
            style={[styles.input, styles.commentInput]}
            value={comment}
            onChangeText={setComment}
            placeholder="O que você achou? Conte tudo..."
            placeholderTextColor={Colors.textMuted}
            multiline
            textAlignVertical="top"
            maxLength={500}
          />
        </View>
      </ScrollView>
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
  addPhotoButton: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    marginBottom: Spacing.lg,
  },
  addPhotoText: {
    fontFamily: Typography.bodyMedium,
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: Spacing.sm,
  },
  photoPreviewContainer: {
    marginBottom: Spacing.lg,
  },
  photoPreview: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceLight,
    alignSelf: 'center' as any,
  },
  photoPreviewHorizontal: {
    width: '100%',
    height: 220,
  },
  photoPreviewVertical: {
    width: 280,
    height: 380,
  },
  photoControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  orientationRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  orientationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  orientationButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '15',
  },
  orientationText: {
    fontFamily: Typography.bodyMedium,
    fontSize: 13,
    color: Colors.textMuted,
  },
  orientationTextActive: {
    color: Colors.text,
  },
  removePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  removePhotoText: {
    fontFamily: Typography.bodyMedium,
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
  commentInput: {
    minHeight: 100,
    paddingTop: Spacing.md,
  },
  categoryDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryDropdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  categoryDropdownEmoji: {
    fontSize: 20,
  },
  categoryDropdownText: {
    fontFamily: Typography.bodyMedium,
    fontSize: 15,
    color: Colors.text,
  },
  categoryDropdownPlaceholder: {
    fontFamily: Typography.body,
    fontSize: 15,
    color: Colors.textMuted,
  },
  categoryDropdownList: {
    marginTop: Spacing.xs,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  categoryDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  categoryDropdownItemColor: {
    width: 4,
    height: 24,
    borderRadius: 2,
  },
  categoryDropdownItemEmoji: {
    fontSize: 18,
  },
  categoryDropdownItemText: {
    flex: 1,
    fontFamily: Typography.bodyMedium,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  noCategoryBox: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  noCategoryText: {
    fontFamily: Typography.bodyMedium,
    fontSize: 14,
    color: Colors.primary,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  ratingValue: {
    fontFamily: Typography.heading,
    fontSize: 28,
    color: Colors.accent,
  },
  ratingHint: {
    fontFamily: Typography.body,
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
  },
});
