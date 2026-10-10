import { useState } from 'react';
import { Chip } from '../ui/Chip';
import { GitCommit, Clock, ArrowRight, ShieldAlert } from 'lucide-react';

/**
 * Task card matching the approved Stitch Observatory design.
 * Supports inline editing, dependency display, and pending sync badges.
 *
 * @param {Object} props
 * @param {Object} props.task
 * @param {string} props.replicaKey - 'replicaA' | 'replicaB'
 * @param {(replicaKey: string, taskId: string, newTitle: string) => void} props.onTitleChange
 */
export function TaskCard({ task, replicaKey, onTitleChange }) {
  const [prevTaskTitle, setPrevTaskTitle] = useState(task.title);
  const [title, setTitle] = useState(task.title);
  const [isEditing, setIsEditing] = useState(false);

  if (task.title !== prevTaskTitle) {
    setPrevTaskTitle(task.title);
    if (!isEditing) {
      setTitle(task.title);
    }
  }

  const handleBlur = () => {
    setIsEditing(false);
    if (title.trim() !== task.title) {
      onTitleChange(replicaKey, task.id, title.trim());
    }
  };

  const isPending = task.syncStatus === 'PENDING_SYNC';
  const hasDownstream = task.impactMeta?.downstreamCount > 0;

  return (
    <div
      className={`bg-[var(--paper)] border rounded-lg p-4 transition-all duration-200 relative group ${
        isPending
          ? 'border-[var(--copper)] shadow-xs bg-[#FAF5EC]'
          : 'border-[var(--border)] hover:border-[var(--dial-ring)]'
      }`}
      data-card-id={task.id}
    >
      {/* Top Tag & Due Date */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="px-2 py-0.5 rounded-[4px] text-[10px] font-mono uppercase bg-[#DDD1B8]/40 text-[var(--ink-soft)] font-medium">
            {task.category || 'CRDT Task'}
          </span>

          {/* Pending Sync Badge */}
          {isPending && (
            <Chip variant="copper" hasDot className="text-[10px]">
              Pending Sync
            </Chip>
          )}

          {/* Conflict Badge (if held) */}
          {task.isHeld && (
            <Chip variant="ochre" hasDot className="text-[10px]">
              Held · Conflict
            </Chip>
          )}
        </div>

        <div className="flex items-center gap-1 font-mono text-[10px] text-[var(--ink-faint)] shrink-0">
          <Clock className="w-3 h-3 text-[var(--ink-faint)]" />
          <span>Due: {task.dueDate || 'Unset'}</span>
        </div>
      </div>

      {/* Editable Title Input */}
      <div className="mt-2.5">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onFocus={() => setIsEditing(true)}
          onBlur={handleBlur}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.currentTarget.blur();
          }}
          className={`w-full bg-transparent font-sans font-medium text-[var(--ink)] text-sm sm:text-[15px] focus:outline-none border-b transition-colors ${
            isEditing
              ? 'border-[var(--copper)] pb-0.5'
              : 'border-transparent hover:border-[var(--line)]'
          }`}
          placeholder="Enter task description..."
        />
      </div>

      {/* Dependency & Impact Information (Structured for Future Impact Predictor) */}
      {(task.dependencies?.length > 0 || hasDownstream) && (
        <div className="mt-2.5 pt-2 border-t border-[var(--line)]/50 flex flex-wrap items-center gap-3 font-mono text-[10px] text-[var(--ink-soft)]">
          {task.dependencies?.length > 0 && (
            <span className="flex items-center gap-1 text-[var(--ink-faint)]">
              <span>Depends on:</span>
              <span className="font-semibold text-[var(--ink)]">
                {task.dependencies.join(', ')}
              </span>
            </span>
          )}

          {hasDownstream && (
            <span className="flex items-center gap-1 text-[var(--copper)] font-medium">
              <ArrowRight className="w-3 h-3" />
              <span>{task.impactMeta.downstreamCount} downstream task connected</span>
            </span>
          )}

          {task.impactMeta?.riskLevel === 'MEDIUM' && (
            <span className="flex items-center gap-1 text-[var(--ochre)]">
              <ShieldAlert className="w-3 h-3" />
              <span>Dependency check required</span>
            </span>
          )}
        </div>
      )}

      {/* Bottom Metadata Bar */}
      <div className="mt-3 pt-2 border-t border-[var(--line)]/60 flex items-center justify-between font-mono text-[10px] text-[var(--ink-faint)]">
        <span className="flex items-center gap-1">
          <GitCommit className="w-3 h-3 text-[var(--ink-faint)]" />
          <span>v{task.version || 14}</span>
          <span className="text-[var(--border)]">·</span>
          <span className="truncate max-w-[80px]">{task.id}</span>
        </span>

        <span
          className={
            isPending
              ? 'text-[var(--copper)] font-semibold'
              : 'text-[var(--verdigris)]'
          }
        >
          {isPending ? 'Queued in Local IDB' : 'Persisted Locally'}
        </span>
      </div>
    </div>
  );
}
