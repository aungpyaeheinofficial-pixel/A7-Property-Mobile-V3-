"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { readStoredIds, STORAGE_KEYS, writeStoredIds } from "@/lib/local-storage";
import { allProperties, type Property } from "@/lib/properties";

const MAX_COMPARISON_HOMES = 4;

type CompareToggleResult = "added" | "removed" | "limit";

function usePropertyComparison() {
  const [comparisonIds, setComparisonIds] = useState<string[]>([]);

  useEffect(() => {
    queueMicrotask(() => setComparisonIds(readStoredIds(STORAGE_KEYS.compare).slice(0, MAX_COMPARISON_HOMES)));

    function handleStoredIds(event: Event) {
      const detail = (event as CustomEvent<{ key?: string; ids?: string[] }>).detail;
      if (detail?.key !== STORAGE_KEYS.compare || !Array.isArray(detail.ids)) return;
      setComparisonIds(detail.ids.slice(0, MAX_COMPARISON_HOMES));
    }

    function handleStorage(event: StorageEvent) {
      if (event.key !== STORAGE_KEYS.compare) return;
      setComparisonIds(readStoredIds(STORAGE_KEYS.compare).slice(0, MAX_COMPARISON_HOMES));
    }

    window.addEventListener("a7:stored-ids-change", handleStoredIds);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("a7:stored-ids-change", handleStoredIds);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const comparisonProperties = useMemo(
    () => comparisonIds.map((id) => allProperties.find((property) => property.id === id)).filter((property): property is Property => Boolean(property)),
    [comparisonIds],
  );

  const toggleProperty = useCallback((property: Property): CompareToggleResult => {
    const current = readStoredIds(STORAGE_KEYS.compare).slice(0, MAX_COMPARISON_HOMES);
    if (current.includes(property.id)) {
      writeStoredIds(STORAGE_KEYS.compare, current.filter((id) => id !== property.id));
      return "removed";
    }
    if (current.length >= MAX_COMPARISON_HOMES) return "limit";
    writeStoredIds(STORAGE_KEYS.compare, [...current, property.id]);
    return "added";
  }, []);

  const removeProperty = useCallback((propertyId: string) => {
    const current = readStoredIds(STORAGE_KEYS.compare);
    writeStoredIds(STORAGE_KEYS.compare, current.filter((id) => id !== propertyId));
  }, []);

  const clearComparison = useCallback(() => writeStoredIds(STORAGE_KEYS.compare, []), []);

  return {
    comparisonIds,
    comparisonProperties,
    maxComparisonHomes: MAX_COMPARISON_HOMES,
    isCompared: (propertyId: string) => comparisonIds.includes(propertyId),
    toggleProperty,
    removeProperty,
    clearComparison,
  };
}

export { MAX_COMPARISON_HOMES, usePropertyComparison };
export type { CompareToggleResult };
