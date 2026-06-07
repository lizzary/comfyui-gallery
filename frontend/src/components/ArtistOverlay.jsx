import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { listIllustrations, uploadIllustrations, updateArtist, deleteIllustration } from '../api';
import { useToast } from './Toast';
import ConfirmModal from './ConfirmModal';
import Lightbox from './Lightbox';
import IllustrationCard from './IllustrationCard';
import ColorGroup from './ColorGroup';
import GroupConfigModal from './GroupConfigModal';
import useGroupConfig from '../hooks/useGroupConfig';
import { matchesTagPair, matchesPromptPair, groupIllustrations, GROUP_BY_OPTIONS } from '../utils/grouping';

const SORT_OPTIONS = [
  { value: '', label: 'Default Order' },
  { value: 'resolution', label: 'Resolution' },
  { value: 'fileSize', label: 'File Size' },
  { value: 'dateCreated', label: 'Date Created' },
];

// ── Main component ───────────────────────────────────────

export default function ArtistOverlay({ artist, onClose, onArtistUpdated }) {
  const [illustrations, setIllustrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [coverTarget, setCoverTarget] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [lastClickedId, setLastClickedId] = useState(null);
  const [batchDeleting, setBatchDeleting] = useState(false);
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [groupBy, setGroupBy] = useState('none');
  const [collapsedGroups, setCollapsedGroups] = useState(new Set());
  const [showGroupConfig, setShowGroupConfig] = useState(false);
  const fileInputRef = useRef(null);
  const { addToast } = useToast();

  const tagGroupConfig = useGroupConfig('tag');
  const promptGroupConfig = useGroupConfig('prompt');

  const activeConfig = groupBy === 'tag' ? tagGroupConfig : promptGroupConfig;

  const fetchIllustrations = useCallback(async () => {
    try {
      const data = await listIllustrations(artist.id);
      setIllustrations(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [artist.id]);

  useEffect(() => {
    fetchIllustrations();
  }, [fetchIllustrations]);

  const sortedIllustrations = useMemo(() => {
    if (!sortBy) return illustrations;
    const sorted = [...illustrations].sort((a, b) => {
      let valA, valB;
      switch (sortBy) {
        case 'resolution':
          valA = (a.width || 0) * (a.height || 0);
          valB = (b.width || 0) * (b.height || 0);
          break;
        case 'fileSize':
          valA = a.file_size || 0;
          valB = b.file_size || 0;
          break;
        case 'dateCreated':
          valA = a.created_at || '';
          valB = b.created_at || '';
          break;
        default:
          return 0;
      }
      if (sortOrder === 'asc') return valA > valB ? 1 : valA < valB ? -1 : 0;
      return valA < valB ? 1 : valA > valB ? -1 : 0;
    });
    return sorted;
  }, [illustrations, sortBy, sortOrder]);

  // ── Grouping ───────────────────────────────────────────

  const groupedIllustrations = useMemo(() => {
    if (groupBy === 'none' || activeConfig.pairs.length === 0) return null;
    const matchFn = groupBy === 'tag' ? matchesTagPair : matchesPromptPair;
    return groupIllustrations(
      sortedIllustrations,
      activeConfig.pairs,
      activeConfig.otherColor,
      matchFn
    );
  }, [groupBy, sortedIllustrations, activeConfig]);

  // Flat list matching visual order (for index lookups in Shift+Click / Lightbox)
  const displayedIllustrations = useMemo(() => {
    if (groupedIllustrations) {
      const flat = [];
      for (const g of groupedIllustrations) {
        if (!collapsedGroups.has(g.id)) {
          flat.push(...g.items);
        }
      }
      return flat;
    }
    return sortedIllustrations;
  }, [groupedIllustrations, collapsedGroups, sortedIllustrations]);

  const toggleGroupCollapse = useCallback((groupId) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  }, []);

  // ── Handlers ───────────────────────────────────────────

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    setError('');
    setSelectedIds(new Set());
    setLastClickedId(null);
    try {
      await uploadIllustrations(artist.id, files);
      await fetchIllustrations();
      if (onArtistUpdated) onArtistUpdated();
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSetCoverConfirm = async () => {
    if (!coverTarget) return;
    try {
      await updateArtist(artist.id, { cover_illustration_id: coverTarget.id });
      setCoverTarget(null);
      addToast('Cover updated successfully', 'success');
      if (onArtistUpdated) onArtistUpdated();
    } catch (err) {
      addToast(err.message || 'Failed to set cover', 'error');
      setCoverTarget(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteIllustration(deleteTarget.id);
      setDeleteTarget(null);
      setSelectedIds((prev) => { const next = new Set(prev); next.delete(deleteTarget.id); return next; });
      addToast('Illustration deleted', 'success');
      await fetchIllustrations();
      if (onArtistUpdated) onArtistUpdated();
    } catch (err) {
      addToast(err.message || 'Failed to delete', 'error');
    }
  };

  const handleBatchDelete = async () => {
    setBatchDeleting(true);
    const ids = [...selectedIds];
    let failed = 0;
    for (const id of ids) {
      try {
        await deleteIllustration(id);
      } catch {
        failed++;
      }
    }
    setBatchDeleting(false);
    setSelectedIds(new Set());
    setLastClickedId(null);
    if (failed === 0) {
      addToast(`${ids.length} illustration(s) deleted`, 'success');
    } else {
      addToast(`${ids.length - failed} deleted, ${failed} failed`, 'error');
    }
    await fetchIllustrations();
    if (onArtistUpdated) onArtistUpdated();
  };

  const handleBatchDownload = async () => {
    const selected = illustrations.filter((i) => selectedIds.has(i.id));
    addToast(`Downloading ${selected.length} file(s)...`, 'success');
    for (const ill of selected) {
      try {
        const res = await fetch(`http://localhost:8000${ill.file_url}`);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = ill.original_filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch {
        // continue to next file on error
      }
    }
  };

  const handleCardClick = (ill) => {
    setSelectedIds(new Set());
    setLastClickedId(ill.id);
    const idx = displayedIllustrations.findIndex((i) => i.id === ill.id);
    if (idx !== -1) setLightboxIndex(idx);
  };

  const handleCtrlClick = (ill) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(ill.id)) next.delete(ill.id);
      else next.add(ill.id);
      return next;
    });
    setLastClickedId(ill.id);
  };

  const handleShiftClick = (ill) => {
    if (lastClickedId === null) {
      handleCtrlClick(ill);
      return;
    }
    const lastIdx = displayedIllustrations.findIndex((i) => i.id === lastClickedId);
    const currIdx = displayedIllustrations.findIndex((i) => i.id === ill.id);
    if (lastIdx === -1 || currIdx === -1) return;
    const [start, end] = lastIdx < currIdx ? [lastIdx, currIdx] : [currIdx, lastIdx];
    const rangeIds = displayedIllustrations.slice(start, end + 1).map((i) => i.id);
    setSelectedIds((prev) => new Set([...prev, ...rangeIds]));
    setLastClickedId(ill.id);
  };

  const handleLightboxDelete = async (ill) => {
    try {
      await deleteIllustration(ill.id);
      setSelectedIds((prev) => { const next = new Set(prev); next.delete(ill.id); return next; });
      addToast('Illustration deleted', 'success');
      await fetchIllustrations();
      if (onArtistUpdated) onArtistUpdated();
    } catch (err) {
      addToast(err.message || 'Failed to delete', 'error');
    }
  };

  const handleLightboxSetCover = async (ill) => {
    try {
      await updateArtist(artist.id, { cover_illustration_id: ill.id });
      addToast('Cover updated successfully', 'success');
      if (onArtistUpdated) onArtistUpdated();
    } catch (err) {
      addToast(err.message || 'Failed to set cover', 'error');
    }
  };

  const cardProps = useCallback((ill) => ({
    key: ill.id,
    illustration: ill,
    onClick: handleCardClick,
    onCtrlClick: handleCtrlClick,
    onShiftClick: handleShiftClick,
    onSetCover: setCoverTarget,
    onDelete: setDeleteTarget,
    isSelected: selectedIds.has(ill.id),
    showHoverActions: true,
  }), [selectedIds, lastClickedId, displayedIllustrations]);

  // ── Render ─────────────────────────────────────────────

  return (
    <>
      <div className="fixed inset-0 z-50 flex flex-col bg-surface-primary">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-edge-primary shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-surface-tertiary text-content-tertiary hover:text-content-secondary transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-lg font-semibold text-content-primary">{artist.name}</h2>
            <span className="text-sm text-content-muted">{illustrations.length} illustrations</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Sort controls */}
            {illustrations.length > 1 && (
              <div className="flex items-center gap-1">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-surface-tertiary border border-edge-secondary rounded-lg px-3 py-1.5 text-xs text-content-secondary focus:outline-none focus:border-accent/50 appearance-none cursor-pointer"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-surface-secondary text-content-primary">
                      {opt.label}
                    </option>
                  ))}
                </select>
                {sortBy && (
                  <button
                    onClick={() => setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))}
                    className="p-1.5 rounded-lg hover:bg-surface-tertiary text-content-tertiary hover:text-content-secondary transition-colors"
                    title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                  >
                    {sortOrder === 'asc' ? (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Group By controls */}
            {illustrations.length > 1 && (
              <div className="flex items-center gap-1">
                <select
                  value={groupBy}
                  onChange={(e) => { setGroupBy(e.target.value); setCollapsedGroups(new Set()); }}
                  className="bg-surface-tertiary border border-edge-secondary rounded-lg px-3 py-1.5 text-xs text-content-secondary focus:outline-none focus:border-accent/50 appearance-none cursor-pointer"
                >
                  {GROUP_BY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-surface-secondary text-content-primary">
                      {opt.label}
                    </option>
                  ))}
                </select>
                {groupBy !== 'none' && (
                  <button
                    onClick={() => setShowGroupConfig(true)}
                    className="p-1.5 rounded-lg hover:bg-surface-tertiary text-content-tertiary hover:text-content-secondary transition-colors"
                    title={`Configure ${groupBy === 'tag' ? 'Tag' : 'Prompt'} Groups`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                )}
              </div>
            )}

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover disabled:opacity-50 text-sm font-medium text-white transition-colors"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-danger/30 border border-danger text-danger text-sm">
              {error}
              <button onClick={() => setError('')} className="ml-2 underline hover:opacity-80">Dismiss</button>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center h-64 text-content-muted text-sm">Loading...</div>
          ) : illustrations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-content-muted">
              <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
              </svg>
              <p className="text-sm">No illustrations yet. Click Upload above.</p>
            </div>
          ) : groupedIllustrations ? (
            /* Grouped rendering */
            <div>
              {groupedIllustrations.map((group) => (
                <ColorGroup
                  key={group.id}
                  group={group}
                  collapsed={collapsedGroups.has(group.id)}
                  onToggle={() => toggleGroupCollapse(group.id)}
                >
                  {group.items.map((ill) => (
                    <IllustrationCard {...cardProps(ill)} />
                  ))}
                </ColorGroup>
              ))}
            </div>
          ) : (
            /* Flat grid (no grouping) */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              <AnimatePresence mode="popLayout">
                {sortedIllustrations.map((ill) => (
                  <IllustrationCard {...cardProps(ill)} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Key hints */}
        {selectedIds.size === 0 && illustrations.length > 0 && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[55] px-4 py-2 rounded-lg bg-overlay/50 backdrop-blur text-xs text-content-muted flex items-center gap-3 select-none">
            <span><kbd className="px-1 py-0.5 rounded bg-edge-subtle/10 text-content-tertiary text-[10px] font-mono">Click</kbd> to view</span>
            <span className="text-content-muted/50">|</span>
            <span><kbd className="px-1 py-0.5 rounded bg-edge-subtle/10 text-content-tertiary text-[10px] font-mono">Ctrl+Click</kbd> multi-select</span>
            <span className="text-content-muted/50">|</span>
            <span><kbd className="px-1 py-0.5 rounded bg-edge-subtle/10 text-content-tertiary text-[10px] font-mono">Shift+Click</kbd> range select</span>
          </div>
        )}

        {/* Batch action bar */}
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-[55] bg-surface-secondary border-t border-edge-primary px-6 py-4 flex items-center justify-between shadow-2xl"
          >
            <span className="text-sm text-content-secondary">{selectedIds.size} selected</span>
            <div className="flex items-center gap-3">
              <button
                onClick={handleBatchDownload}
                className="px-4 py-2 rounded-lg bg-surface-tertiary hover:bg-edge-secondary text-sm text-content-secondary transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </button>
              <button
                onClick={handleBatchDelete}
                disabled={batchDeleting}
                className="px-4 py-2 rounded-lg bg-danger hover:bg-danger-hover disabled:opacity-50 text-sm text-white transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {batchDeleting ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={() => { setSelectedIds(new Set()); setLastClickedId(null); }}
                className="px-3 py-2 rounded-lg text-sm text-content-muted hover:text-content-secondary transition-colors"
              >
                Clear
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Group Config Modal */}
      <AnimatePresence>
        {showGroupConfig && (
          <GroupConfigModal
            type={groupBy}
            pairs={activeConfig.pairs}
            palette={activeConfig.palette}
            otherColor={activeConfig.otherColor}
            onSave={(pairs) => {
              activeConfig.setPairs(pairs);
              setShowGroupConfig(false);
            }}
            onClose={() => setShowGroupConfig(false)}
          />
        )}
      </AnimatePresence>

      {/* Confirm: set as cover */}
      {coverTarget && (
        <ConfirmModal
          title="Set as Cover"
          message={`Use "${coverTarget.original_filename}" as the cover for ${artist.name}?`}
          confirmText="Set Cover"
          onConfirm={handleSetCoverConfirm}
          onCancel={() => setCoverTarget(null)}
        />
      )}

      {/* Confirm: delete illustration */}
      {deleteTarget && (
        <ConfirmModal
          title="Delete Illustration"
          message={`Are you sure you want to delete "${deleteTarget.original_filename}"?`}
          confirmText="Delete"
          danger
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          illustrations={displayedIllustrations}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onDelete={handleLightboxDelete}
          onSetCover={handleLightboxSetCover}
          onUpdate={(updated) => {
            setIllustrations((prev) =>
              prev.map((i) => (i.id === updated.id ? updated : i))
            );
          }}
        />
      )}
    </>
  );
}
