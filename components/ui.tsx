'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

/* ---------------- MODAL ---------------- */

export function Modal({
  title,
  icon,
  onClose,
  children,
  footer,
  wide,
}: {
  title: string;
  icon?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="overlay" onClick={onClose}>
      <div
        className="modal"
        style={wide ? { maxWidth: 940 } : undefined}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="modal-head">
          {icon && <span style={{ fontSize: 19 }}>{icon}</span>}
          <span className="modal-title">{title}</span>
          <button className="close-x" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

/* ---------------- TOASTS ---------------- */

export type ToastMsg = { id: number; text: string; icon: string };

export function useToasts() {
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const counter = useRef(0);

  const push = (text: string, icon = '✅') => {
    const id = ++counter.current;
    setToasts((t) => [...t, { id, text, icon }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2800);
  };

  return { toasts, push };
}

export function Toasts({ toasts }: { toasts: ToastMsg[] }) {
  return (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="toast">
          <span className="toast-ico">{t.icon}</span>
          <span>{t.text}</span>
        </div>
      ))}
    </div>
  );
}

/* ---------------- FORM CONTROLS ---------------- */

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="field">
      <label>{label}</label>
      {children}
      {hint && <span className="field-hint">{hint}</span>}
    </div>
  );
}

export function Slider({
  label,
  value,
  onChange,
  color = '#8b5cf6',
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  color?: string;
  hint?: string;
}) {
  return (
    <div className="field">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <label>{label}</label>
        <b style={{ fontSize: 13, color, fontVariantNumeric: 'tabular-nums' }}>{value}</b>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          width: '100%',
          height: 5,
          borderRadius: 4,
          appearance: 'none',
          background: `linear-gradient(90deg, ${color} ${value}%, rgba(255,255,255,.12) ${value}%)`,
          cursor: 'pointer',
          outline: 'none',
        }}
      />
      {hint && <span className="field-hint">{hint}</span>}
    </div>
  );
}

export function CheckRow({
  done,
  label,
  hint,
  script,
  onToggle,
}: {
  done: boolean;
  label: string;
  hint?: string;
  script?: string;
  onToggle: () => void;
}) {
  return (
    <div className={`check-row ${done ? 'done' : ''}`} onClick={onToggle} role="checkbox" aria-checked={done} tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(); } }}
    >
      <span className={`check-box ${done ? 'on' : ''}`}>{done ? '✓' : ''}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="check-label">{label}</div>
        {hint && <div className="check-hint">{hint}</div>}
        {script && <code className="check-script">{script}</code>}
      </div>
    </div>
  );
}

/* ---------------- TAG EDITOR ---------------- */

export function TagEditor({
  tags,
  onChange,
  placeholder = 'Add and press Enter…',
}: {
  tags: string[];
  onChange: (t: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState('');

  const add = () => {
    const v = draft.trim();
    if (!v) return;
    if (!tags.includes(v)) onChange([...tags, v]);
    setDraft('');
  };

  return (
    <div>
      <div className="chips" style={{ marginBottom: tags.length ? 8 : 0 }}>
        {tags.map((t) => (
          <span key={t} className="chip chip-violet">
            {t}
            <button
              onClick={() => onChange(tags.filter((x) => x !== t))}
              style={{ marginLeft: 2, opacity: 0.7, fontSize: 12 }}
              aria-label={`Remove ${t}`}
            >
              ✕
            </button>
          </span>
        ))}
      </div>
      <input
        className="input"
        style={{ width: '100%' }}
        value={draft}
        placeholder={placeholder}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            add();
          }
        }}
        onBlur={add}
      />
    </div>
  );
}

/* ---------------- MISC ---------------- */

export function Empty({
  icon,
  title,
  sub,
  action,
}: {
  icon: string;
  title: string;
  sub: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty">
      <div className="empty-ico">{icon}</div>
      <div className="empty-title">{title}</div>
      <div className="empty-sub">{sub}</div>
      {action}
    </div>
  );
}

export function ProgressBar({ pct, label }: { pct: number; label?: string }) {
  return (
    <div>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, marginBottom: 6 }}>
          <span className="muted">{label}</span>
          <b style={{ fontVariantNumeric: 'tabular-nums' }}>{pct}%</b>
        </div>
      )}
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function Confirm({
  title,
  message,
  onConfirm,
  onCancel,
  danger = true,
}: {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}) {
  return (
    <Modal
      title={title}
      icon={danger ? '⚠️' : '❓'}
      onClose={onCancel}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
          <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>
            Confirm
          </button>
        </>
      }
    >
      <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--muted)' }}>{message}</p>
    </Modal>
  );
}
