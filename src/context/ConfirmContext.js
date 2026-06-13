import { createContext, useContext, useState, useCallback, useRef } from 'react';

const ConfirmContext = createContext(null);

const ConfirmModal = ({ open, title, message, confirmLabel, cancelLabel, onConfirm, onCancel }) => {
  if (!open) return null;

  return (
    <div className="confirm-overlay" onClick={onCancel} role="presentation">
      <div
        className="confirm-modal"
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
      >
        <h3 id="confirm-title">{title}</h3>
        <p id="confirm-message">{message}</p>
        <div className="confirm-actions">
          <button type="button" className="btn btn-outline-dark" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className="btn btn-danger" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export const ConfirmProvider = ({ children }) => {
  const [state, setState] = useState({
    open: false,
    title: 'Confirm',
    message: '',
    confirmLabel: 'Delete',
    cancelLabel: 'Cancel',
  });
  const resolveRef = useRef(null);

  const confirm = useCallback((options = {}) => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setState({
        open: true,
        title: options.title || 'Confirm',
        message: options.message || 'Are you sure you want to continue?',
        confirmLabel: options.confirmLabel || 'Delete',
        cancelLabel: options.cancelLabel || 'Cancel',
      });
    });
  }, []);

  const handleClose = (result) => {
    setState((prev) => ({ ...prev, open: false }));
    if (resolveRef.current) {
      resolveRef.current(result);
      resolveRef.current = null;
    }
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <ConfirmModal
        open={state.open}
        title={state.title}
        message={state.message}
        confirmLabel={state.confirmLabel}
        cancelLabel={state.cancelLabel}
        onConfirm={() => handleClose(true)}
        onCancel={() => handleClose(false)}
      />
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within ConfirmProvider');
  }
  return context.confirm;
};
