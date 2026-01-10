/**
 * useMushafConfig - Hook for managing Mushaf configuration
 *
 * Provides state management for MushafConfig with preset switching and overrides
 */

import { useState, useCallback, useMemo } from 'react';
import type {
  MushafConfig,
  MushafConfigOverrides,
} from '@digitalkhatt/quran-engine';
import {
  getMushafPreset,
  getAvailablePresets,
  extendPreset,
} from '@digitalkhatt/quran-engine';

export interface UseMushafConfigOptions {
  /** Initial preset ID to load */
  preset?: string;
  /** Overrides to apply on top of the preset */
  overrides?: MushafConfigOverrides;
  /** Base config to use instead of a preset */
  baseConfig?: MushafConfig;
}

export interface UseMushafConfigReturn {
  /** Current mushaf configuration */
  config: MushafConfig;
  /** Current preset ID (if using a preset) */
  presetId: string | null;
  /** Set a new configuration directly */
  setConfig: (config: MushafConfig) => void;
  /** Apply overrides to the current configuration */
  applyOverrides: (overrides: MushafConfigOverrides) => void;
  /** Switch to a different preset */
  switchPreset: (presetId: string, overrides?: MushafConfigOverrides) => void;
  /** Reset to the initial configuration */
  reset: () => void;
  /** List of available preset IDs */
  availablePresets: string[];
  /** Check if tajweed is enabled */
  isTajweedEnabled: boolean;
  /** Toggle tajweed on/off */
  toggleTajweed: () => void;
  /** Set tajweed enabled state */
  setTajweedEnabled: (enabled: boolean) => void;
  /** Get a specific config section */
  getSection: <K extends keyof MushafConfig>(key: K) => MushafConfig[K];
  /** Update a specific config section */
  updateSection: <K extends keyof MushafConfig>(
    key: K,
    value: Partial<MushafConfig[K]>
  ) => void;
}

/**
 * Deep merge two objects
 */
function deepMerge<T extends object>(target: T, source: Partial<T>): T {
  const result = { ...target };

  for (const key in source) {
    if (source[key] !== undefined) {
      if (
        typeof source[key] === 'object' &&
        source[key] !== null &&
        !Array.isArray(source[key]) &&
        typeof target[key] === 'object' &&
        target[key] !== null
      ) {
        (result as Record<string, unknown>)[key] = deepMerge(
          target[key] as object,
          source[key] as object
        );
      } else {
        (result as Record<string, unknown>)[key] = source[key];
      }
    }
  }

  return result;
}

/**
 * Hook for managing Mushaf configuration state
 */
export function useMushafConfig(
  options: UseMushafConfigOptions = {}
): UseMushafConfigReturn {
  const { preset = 'madinah-standard', overrides, baseConfig } = options;

  // Resolve initial configuration
  const initialConfig = useMemo(() => {
    if (baseConfig) {
      return overrides ? deepMerge(baseConfig, overrides as Partial<MushafConfig>) : baseConfig;
    }

    const presetConfig = getMushafPreset(preset);
    if (!presetConfig) {
      console.warn(`Unknown preset: ${preset}, falling back to madinah-standard`);
      return getMushafPreset('madinah-standard')!;
    }

    return overrides
      ? extendPreset(preset, overrides)
      : presetConfig;
  }, [preset, overrides, baseConfig]);

  // State
  const [config, setConfigState] = useState<MushafConfig>(initialConfig);
  const [currentPresetId, setCurrentPresetId] = useState<string | null>(
    baseConfig ? null : preset
  );

  // Available presets
  const availablePresets = useMemo(() => getAvailablePresets(), []);

  // Set config directly
  const setConfig = useCallback((newConfig: MushafConfig) => {
    setConfigState(newConfig);
    setCurrentPresetId(null);
  }, []);

  // Apply overrides to current config
  const applyOverrides = useCallback((newOverrides: MushafConfigOverrides) => {
    setConfigState((current) =>
      deepMerge(current, newOverrides as Partial<MushafConfig>)
    );
  }, []);

  // Switch to a different preset
  const switchPreset = useCallback(
    (newPresetId: string, newOverrides?: MushafConfigOverrides) => {
      const presetConfig = getMushafPreset(newPresetId);
      if (!presetConfig) {
        console.warn(`Unknown preset: ${newPresetId}`);
        return;
      }

      const finalConfig = newOverrides
        ? extendPreset(newPresetId, newOverrides)
        : presetConfig;

      setConfigState(finalConfig);
      setCurrentPresetId(newPresetId);
    },
    []
  );

  // Reset to initial configuration
  const reset = useCallback(() => {
    setConfigState(initialConfig);
    setCurrentPresetId(baseConfig ? null : preset);
  }, [initialConfig, baseConfig, preset]);

  // Tajweed helpers
  const isTajweedEnabled = config.tajweed.enabled;

  const toggleTajweed = useCallback(() => {
    setConfigState((current) => ({
      ...current,
      tajweed: {
        ...current.tajweed,
        enabled: !current.tajweed.enabled,
      },
    }));
  }, []);

  const setTajweedEnabled = useCallback((enabled: boolean) => {
    setConfigState((current) => ({
      ...current,
      tajweed: {
        ...current.tajweed,
        enabled,
      },
    }));
  }, []);

  // Section helpers
  const getSection = useCallback(
    <K extends keyof MushafConfig>(key: K): MushafConfig[K] => {
      return config[key];
    },
    [config]
  );

  const updateSection = useCallback(
    <K extends keyof MushafConfig>(key: K, value: Partial<MushafConfig[K]>) => {
      setConfigState((current) => ({
        ...current,
        [key]:
          typeof current[key] === 'object' && current[key] !== null
            ? { ...current[key], ...value }
            : value,
      }));
    },
    []
  );

  return {
    config,
    presetId: currentPresetId,
    setConfig,
    applyOverrides,
    switchPreset,
    reset,
    availablePresets,
    isTajweedEnabled,
    toggleTajweed,
    setTajweedEnabled,
    getSection,
    updateSection,
  };
}

export default useMushafConfig;
