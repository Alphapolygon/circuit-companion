import { useMemo, useState } from 'react';
import { createId } from '../utils/app.js';

const colorLookup = {
  cyan: '#2dc8ff',
  purple: '#8d7dff',
  green: '#63f08a',
  amber: '#ffb24d',
  lime: '#b6ff59',
  blue: '#4b9dff',
};

export function useMacroMatrix({ macroSources, paramsMeta, initialRoutes = [], maxRoutes = 32 }) {
  const [armedSource, setArmedSource] = useState(null);
  const [routes, setRoutes] = useState(initialRoutes);

  const sourceMap = useMemo(
    () => Object.fromEntries(macroSources.map((source) => [source.id, source])),
    [macroSources]
  );

  const isTargetAssignable = (targetId) => {
    const meta = paramsMeta[targetId];
    return Boolean(meta?.macroAssignable && Number.isInteger(meta?.macroDestination ?? meta?.modDestination));
  };

  const getTargetRoutes = (targetId) => routes.filter((route) => route.targetId === targetId);
  const getMacroRoutes = (sourceId) => routes.filter((route) => route.sourceId === sourceId);

  const assignRoute = (sourceId, targetId) => {
    if (!sourceId || !targetId || !isTargetAssignable(targetId)) return;
    setRoutes((current) => {
      const sourceCount = current.filter((route) => route.sourceId === sourceId).length;
      const exists = current.some((route) => route.sourceId === sourceId && route.targetId === targetId);
      if (exists || current.length >= maxRoutes || sourceCount >= 4) return current;
      return [...current, { id: createId(), sourceId, targetId, depth: 64, start: 0, end: 127 }];
    });
    setArmedSource(null);
  };

  const removeRoute = (routeId) => setRoutes((current) => current.filter((route) => route.id !== routeId));

  const updateRoute = (routeId, patch) => {
    setRoutes((current) => current.map((route) => route.id === routeId ? { ...route, ...patch } : route));
  };

  const onSourceDragStart = (event, sourceId) => {
    event.dataTransfer.setData('text/macro-source', sourceId);
    event.dataTransfer.effectAllowed = 'copy';
    setArmedSource(sourceId);
  };

  const onTargetDrop = (event, targetId) => {
    event.preventDefault();
    const sourceId = event.dataTransfer.getData('text/macro-source') || armedSource;
    assignRoute(sourceId, targetId);
  };

  const onTargetClick = (targetId) => {
    if (armedSource) assignRoute(armedSource, targetId);
  };

  const getSourceTheme = (sourceId) => colorLookup[sourceMap[sourceId]?.color] || '#2dc8ff';

  return {
    armedSource,
    setArmedSource,
    routes,
    setRoutes,
    getTargetRoutes,
    getMacroRoutes,
    assignRoute,
    removeRoute,
    updateRoute,
    onSourceDragStart,
    onTargetDrop,
    onTargetClick,
    getSourceTheme,
    isTargetAssignable,
    maxRoutes,
  };
}
