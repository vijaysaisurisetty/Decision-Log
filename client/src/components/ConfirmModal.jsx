import React from "react";
import Modal from "./Modal";

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "ARE YOU SURE?",
  message = "This action cannot be undone.",
  confirmText = "Confirm",
  confirmVariant = "danger",
  loading = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div style={{ marginBottom: "24px" }}>
        <p
          style={{
            fontSize: "15px",
            fontWeight: 600,
            color: "var(--ink)",
            lineHeight: 1.5,
          }}
        >
          {message}
        </p>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="btn btn-white press"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className={`btn ${confirmVariant === "danger" ? "btn-danger" : "btn-red"} press`}
        >
          {loading ? <span className="spinner" /> : confirmText}
        </button>
      </div>
    </Modal>
  );
}
