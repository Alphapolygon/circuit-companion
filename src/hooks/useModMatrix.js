import { useMemo, useState } from 'react';
import { createId } from '../utils/app.js';
import { HARDWARE_MOD_SLOT_COUNT } from '../data/circuitTracks.js';

const colorLookup = {
  cyan: '#2dc8ff',
  purple: '#8d7dff',
  green: '#63f08a',
  amber: '#ffb24d',
  lime: '#b6ff59',
  blue: '#4b9dff',
};

export function useModMatrix({ modSources, paramsMeta, initialRoutes = [] }) {
  const [armedSource, setArmedSource] = useState(null);
  const [routes, setRoutes] = useState(initialRoutes);

  const sourceMap = useMemo(
    () => Object.fromEntries(modSources.map((source) => [source.id, source])),
    [modSources]
  );

  const isTargetModulatable = (targetId) => Boolean(paramsMeta[targetId]?.modulatable && Number.isInteger(paramsMeta[targetId]?.modDestination));
  const getTargetRoutes = (targetId) => routes.filter((route) => route.targetId === targetId);

  const assignRoute = (sourceId, targetId) => {
    if (!sourceId || !targetId || !isTargetModulatable(targetId)) return;
    setRoutes((current) => {
      const exists = current.some((route) => route.sourceId === sourceId && route.targetId === targetId);
      if (exists || current.length >= HARDWARE_MOD_SLOT_COUNT) return current;
      return [...current, { id: createId(), sourceId, targetId, amount: 64 }];
    });
    setArmedSource(null);
  };

  const removeRoute = (routeId) => {
    setRoutes((current) => current.filter((route) => route.id !== routeId));
  };

  const updateRouteAmount = (routeId, amount) => {
    setRoutes((current) => current.map((route) => route.id === routeId ? { ...route, amount } : route));
  };

  const onSourceDragStart = (event, sourceId) => {
    event.dataTransfer.setData('text/mod-source', sourceId);
    event.dataTransfer.effectAllowed = 'copy';
    setArmedSource(sourceId);
  };

  const onTargetDrop = (event, targetId) => {
    event.preventDefault();
    const sourceId = event.dataTransfer.getData('text/mod-source') || armedSource;
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
    assignRoute,
    removeRoute,
    updateRouteAmount,
    onSourceDragStart,
    onTargetDrop,
    onTargetClick,
    getSourceTheme,
    isTargetModulatable,
    maxRoutes: HARDWARE_MOD_SLOT_COUNT,
  };
}
