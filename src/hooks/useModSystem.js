import { useMemo, useState } from 'react';

const colorLookup = {
  cyan: '#26c6ff',
  purple: '#8d7dff',
  green: '#59f28f',
  amber: '#ffbb55',
  lime: '#b5ff4f',
  blue: '#4ba3ff',
};

export function useModSystem(modSources) {
  const [armedSource, setArmedSource] = useState(null);
  const [routes, setRoutes] = useState([
    { id: crypto.randomUUID(), sourceId: 'LFO_1', targetId: 'filter_cutoff', amount: 68 },
    { id: crypto.randomUUID(), sourceId: 'ENV_3', targetId: 'fx_reverb_mix', amount: 30 },
    { id: crypto.randomUUID(), sourceId: 'MACRO_1', targetId: 'noise_level', amount: 45 },
  ]);

  const sourceMap = useMemo(
    () => Object.fromEntries(modSources.map((source) => [source.id, source])),
    [modSources]
  );

  const getTargetRoutes = (targetId) => routes.filter((route) => route.targetId === targetId);

  const assignRoute = (sourceId, targetId) => {
    if (!sourceId || !targetId) return;
    const exists = routes.some((route) => route.sourceId === sourceId && route.targetId === targetId);
    if (exists) {
      setArmedSource(null);
      return;
    }

    setRoutes((current) => [
      ...current,
      { id: crypto.randomUUID(), sourceId, targetId, amount: 48 },
    ]);
    setArmedSource(null);
  };

  const removeRoute = (routeId) => {
    setRoutes((current) => current.filter((route) => route.id !== routeId));
  };

  const updateRoute = (routeId, amount) => {
    setRoutes((current) =>
      current.map((route) => (route.id === routeId ? { ...route, amount } : route))
    );
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

  const getSourceTheme = (sourceId) => {
    const source = sourceMap[sourceId];
    return colorLookup[source?.color] || '#26c6ff';
  };

  return {
    armedSource,
    setArmedSource,
    routes,
    getTargetRoutes,
    assignRoute,
    removeRoute,
    updateRoute,
    onSourceDragStart,
    onTargetDrop,
    onTargetClick,
    getSourceTheme,
  };
}
