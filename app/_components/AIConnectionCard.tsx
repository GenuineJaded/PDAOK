/**
 * AIConnectionCard
 *
 * Bring-your-own-key settings, surfaced on the Transmits screen. Lets the user
 * pick a provider, paste an API key, and choose a model. The key lives only on
 * this device and is sent only to the chosen provider.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Linking,
  ActivityIndicator,
} from 'react-native';
import {
  AIConfig,
  AIProvider,
  PROVIDERS,
  getAIConfig,
  saveAIConfig,
  clearAIConfig,
} from '../_services/aiConfig';
import { testConnection } from '../_services/aiClient';

type Status =
  | { kind: 'idle' }
  | { kind: 'saved' }
  | { kind: 'testing' }
  | { kind: 'ok' }
  | { kind: 'error'; message: string };

export default function AIConnectionCard() {
  const [provider, setProvider] = useState<AIProvider>('openrouter');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState(PROVIDERS.openrouter.defaultModel);
  const [showKey, setShowKey] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getAIConfig().then((config) => {
      setProvider(config.provider);
      setApiKey(config.apiKey);
      setModel(config.model);
      setLoaded(true);
    });
  }, []);

  const info = PROVIDERS[provider];

  const switchProvider = (next: AIProvider) => {
    if (next === provider) return;
    // Move the default model along with the provider unless the user typed a
    // custom one for the current provider.
    setModel((current) =>
      current.trim() === '' || current.trim() === PROVIDERS[provider].defaultModel
        ? PROVIDERS[next].defaultModel
        : current
    );
    setProvider(next);
    setStatus({ kind: 'idle' });
  };

  const currentConfig = (): AIConfig => ({
    provider,
    apiKey,
    model: model.trim() || info.defaultModel,
  });

  const handleSave = async () => {
    await saveAIConfig(currentConfig());
    setStatus({ kind: 'saved' });
  };

  const handleTest = async () => {
    await saveAIConfig(currentConfig());
    setStatus({ kind: 'testing' });
    const result = await testConnection();
    setStatus(result.ok ? { kind: 'ok' } : { kind: 'error', message: result.error ?? 'Failed' });
  };

  const handleClear = async () => {
    await clearAIConfig();
    setProvider('openrouter');
    setApiKey('');
    setModel(PROVIDERS.openrouter.defaultModel);
    setStatus({ kind: 'idle' });
  };

  if (!loaded) return null;

  const hasKey = apiKey.trim().length > 0;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>AI CONNECTION</Text>
      <Text style={styles.subtitle}>
        Your key is stored on this device and sent only to the provider — never anywhere else.
      </Text>

      {/* Provider toggle */}
      <View style={styles.providerRow}>
        {Object.values(PROVIDERS).map((p) => (
          <TouchableOpacity
            key={p.id}
            style={[styles.providerButton, provider === p.id && styles.providerButtonActive]}
            onPress={() => switchProvider(p.id)}
          >
            <Text style={[styles.providerText, provider === p.id && styles.providerTextActive]}>
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* API key */}
      <View style={styles.fieldHeader}>
        <Text style={styles.label}>API Key</Text>
        <TouchableOpacity onPress={() => Linking.openURL(info.keysUrl)}>
          <Text style={styles.link}>Get a key ↗</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.keyRow}>
        <TextInput
          style={[styles.input, styles.keyInput]}
          value={apiKey}
          onChangeText={(t) => {
            setApiKey(t);
            setStatus({ kind: 'idle' });
          }}
          placeholder="Paste your API key"
          placeholderTextColor="#666"
          secureTextEntry={!showKey}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity style={styles.showButton} onPress={() => setShowKey((v) => !v)}>
          <Text style={styles.showButtonText}>{showKey ? 'Hide' : 'Show'}</Text>
        </TouchableOpacity>
      </View>

      {/* Model */}
      <View style={styles.fieldHeader}>
        <Text style={styles.label}>Model</Text>
        <TouchableOpacity onPress={() => Linking.openURL(info.modelsUrl)}>
          <Text style={styles.link}>Browse models ↗</Text>
        </TouchableOpacity>
      </View>
      <TextInput
        style={styles.input}
        value={model}
        onChangeText={(t) => {
          setModel(t);
          setStatus({ kind: 'idle' });
        }}
        placeholder={info.modelPlaceholder}
        placeholderTextColor="#666"
        autoCapitalize="none"
        autoCorrect={false}
      />

      {/* Actions */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.actionButton, styles.saveButton, !hasKey && styles.actionDisabled]}
          onPress={handleSave}
          disabled={!hasKey}
        >
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.testButton, !hasKey && styles.actionDisabled]}
          onPress={handleTest}
          disabled={!hasKey || status.kind === 'testing'}
        >
          {status.kind === 'testing' ? (
            <ActivityIndicator size="small" color="#4a9eff" />
          ) : (
            <Text style={styles.testText}>Test</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.clearButton]} onPress={handleClear}>
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
      </View>

      {/* Status line */}
      {status.kind === 'saved' && <Text style={styles.statusOk}>Saved on this device.</Text>}
      {status.kind === 'ok' && <Text style={styles.statusOk}>Connected. The field can speak.</Text>}
      {status.kind === 'error' && (
        <Text style={styles.statusError}>Couldn&apos;t connect: {status.message}</Text>
      )}
      {status.kind === 'idle' && (
        <Text style={styles.statusDim}>{hasKey ? 'Key entered — Save to apply.' : 'No key set.'}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 16,
    marginTop: 8,
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#111',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  providerRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  providerButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
    alignItems: 'center',
  },
  providerButtonActive: {
    borderColor: '#4a9eff',
    backgroundColor: '#1a2030',
  },
  providerText: {
    fontSize: 14,
    color: '#aaa',
    fontWeight: '500',
  },
  providerTextActive: {
    color: '#4a9eff',
    fontWeight: '700',
  },
  fieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  link: {
    fontSize: 12,
    color: '#4a9eff',
    fontWeight: '500',
  },
  keyRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#fff',
  },
  keyInput: {
    flex: 1,
    marginBottom: 0,
  },
  showButton: {
    paddingHorizontal: 14,
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
  },
  showButtonText: {
    color: '#aaa',
    fontSize: 13,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  actionDisabled: {
    opacity: 0.4,
  },
  saveButton: {
    backgroundColor: '#4a9eff',
    borderColor: '#4a9eff',
  },
  saveText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  testButton: {
    backgroundColor: '#1a2030',
    borderColor: '#4a9eff',
  },
  testText: {
    color: '#4a9eff',
    fontSize: 14,
    fontWeight: '600',
  },
  clearButton: {
    backgroundColor: '#1a1a1a',
    borderColor: '#444',
  },
  clearText: {
    color: '#aaa',
    fontSize: 14,
    fontWeight: '600',
  },
  statusOk: {
    marginTop: 12,
    fontSize: 13,
    color: '#5fd38a',
    textAlign: 'center',
  },
  statusError: {
    marginTop: 12,
    fontSize: 13,
    color: '#e08a8a',
    textAlign: 'center',
  },
  statusDim: {
    marginTop: 12,
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },
});
