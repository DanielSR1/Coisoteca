import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Download, Upload, Database, AlertTriangle, CheckCircle } from 'lucide-react-native';
import { Colors, Spacing, BorderRadius, Typography } from '@/lib/theme';
import {
  exportBackup,
  downloadBackupJson,
  importBackup,
  parseBackupFile,
  BackupData,
} from '@/lib/backup';

export default function SettingsScreen() {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);

  const handleExport = useCallback(async () => {
    setExporting(true);
    setLastResult(null);
    try {
      const data = await exportBackup();
      if (data.categories.length === 0 && data.entries.length === 0) {
        Alert.alert('Aviso', 'Não há dados para exportar. O banco de dados está vazio.');
        setExporting(false);
        return;
      }
      downloadBackupJson(data);
      setLastResult(`Backup exportado: ${data.categories.length} categorias, ${data.entries.length} avaliações`);
    } catch {
      Alert.alert('Erro', 'Não foi possível exportar o backup');
    }
    setExporting(false);
  }, []);

  const handleImport = useCallback(() => {
    if (Platform.OS !== 'web') {
      Alert.alert('Indisponível', 'A importação está disponível apenas na versão web.');
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setImporting(true);
      setLastResult(null);

      try {
        const data: BackupData = await parseBackupFile(file);

        Alert.alert(
          'Confirmar importação',
          `Este arquivo contém ${data.categories.length} categorias e ${data.entries.length} avaliações. Os dados existentes com o mesmo ID serão substituídos. Deseja continuar?`,
          [
            { text: 'Cancelar', style: 'cancel', onPress: () => setImporting(false) },
            {
              text: 'Importar',
              onPress: async () => {
                try {
                  const result = await importBackup(data);
                  setLastResult(`Importação concluída: ${result.categories} categorias, ${result.entries} avaliações`);
                  Alert.alert('Sucesso', 'Backup importado com sucesso!');
                } catch (err: any) {
                  Alert.alert('Erro', err.message || 'Não foi possível importar o backup');
                }
                setImporting(false);
              },
            },
          ],
        );
      } catch (err: any) {
        Alert.alert('Erro', err.message || 'Arquivo inválido');
        setImporting(false);
      }
    };
    input.click();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoIcon}>
            <Database size={20} color={Colors.text} strokeWidth={2} />
          </View>
          <View>
            <Text style={styles.pageTitle}>Backup</Text>
            <Text style={styles.pageSubtitle}>Salve e restaure seus dados</Text>
          </View>
        </View>
      </View>

      <View style={styles.warningBox}>
        <AlertTriangle size={18} color={Colors.warning} />
        <Text style={styles.warningText}>
          O backup salva todas as suas categorias e avaliações num arquivo. Use a importação para restaurar seus dados num dispositivo novo ou depois de uma limpeza.
        </Text>
      </View>

      {/* Export */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.cardIcon, { backgroundColor: Colors.success + '22' }]}>
            <Download size={22} color={Colors.success} strokeWidth={2} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>Exportar backup</Text>
            <Text style={styles.cardSubtitle}>
              Baixa um arquivo com todas as categorias e avaliações
            </Text>
          </View>
        </View>
        <Pressable
          style={[styles.actionButton, { backgroundColor: Colors.success }]}
          onPress={handleExport}
          disabled={exporting}
        >
          {exporting ? (
            <ActivityIndicator size="small" color={Colors.text} />
          ) : (
            <>
              <Download size={18} color={Colors.text} strokeWidth={2.5} />
              <Text style={styles.actionButtonText}>Baixar backup</Text>
            </>
          )}
        </Pressable>
      </View>

      {/* Import */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.cardIcon, { backgroundColor: Colors.info + '22' }]}>
            <Upload size={22} color={Colors.info} strokeWidth={2} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>Importar backup</Text>
            <Text style={styles.cardSubtitle}>
              Restaura dados de um arquivo de backup salvo anteriormente
            </Text>
          </View>
        </View>
        <Pressable
          style={[styles.actionButton, { backgroundColor: Colors.info }]}
          onPress={handleImport}
          disabled={importing}
        >
          {importing ? (
            <ActivityIndicator size="small" color={Colors.text} />
          ) : (
            <>
              <Upload size={18} color={Colors.text} strokeWidth={2.5} />
              <Text style={styles.actionButtonText}>Selecionar arquivo</Text>
            </>
          )}
        </Pressable>
      </View>

      {lastResult ? (
        <View style={styles.resultBox}>
          <CheckCircle size={18} color={Colors.success} />
          <Text style={styles.resultText}>{lastResult}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
    fontSize: 14,
    color: Colors.textSecondary,
  },
  warningBox: {
    flexDirection: 'row',
    gap: Spacing.sm,
    backgroundColor: Colors.warning + '15',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.warning + '33',
  },
  warningText: {
    flex: 1,
    fontFamily: Typography.body,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: Typography.headingSemi,
    fontSize: 17,
    color: Colors.text,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontFamily: Typography.body,
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 19,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
  },
  actionButtonText: {
    fontFamily: Typography.bodySemi,
    fontSize: 15,
    color: Colors.text,
  },
  resultBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.success + '15',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.sm,
  },
  resultText: {
    flex: 1,
    fontFamily: Typography.bodyMedium,
    fontSize: 13,
    color: Colors.textSecondary,
  },
});
