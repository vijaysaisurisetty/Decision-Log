import React, { useState } from "react";
import { Plus, X, PlusSquare, MinusSquare, Trash2 } from "lucide-react";
import CornerChip from "./CornerChip";

export default function OptionsEditor({
  options = [],
  onChange,
  fieldErrors = {},
}) {
  const [proInputs, setProInputs] = useState({});
  const [conInputs, setConInputs] = useState({});

  const handleUpdate = (idx, field, val) => {
    const updated = options.map((opt, i) =>
      i === idx ? { ...opt, [field]: val } : opt
    );
    onChange(updated);
  };

  const handleAddOption = () => {
    if (options.length >= 10) return;
    onChange([
      ...options,
      { name: "", description: "", pros: [], cons: [] },
    ]);
  };

  const handleRemoveOption = (idx) => {
    if (options.length <= 2) return;
    onChange(options.filter((_, i) => i !== idx));
  };

  // Add Pro
  const handleAddPro = (idx) => {
    const text = (proInputs[idx] || "").trim();
    if (!text) return;
    const current = options[idx]?.pros || [];
    if (current.length >= 10) return;
    handleUpdate(idx, "pros", [...current, text]);
    setProInputs({ ...proInputs, [idx]: "" });
  };

  const handleRemovePro = (optIdx, proIdx) => {
    const current = options[optIdx]?.pros || [];
    handleUpdate(
      optIdx,
      "pros",
      current.filter((_, i) => i !== proIdx)
    );
  };

  // Add Con
  const handleAddCon = (idx) => {
    const text = (conInputs[idx] || "").trim();
    if (!text) return;
    const current = options[idx]?.cons || [];
    if (current.length >= 10) return;
    handleUpdate(idx, "cons", [...current, text]);
    setConInputs({ ...conInputs, [idx]: "" });
  };

  const handleRemoveCon = (optIdx, conIdx) => {
    const current = options[optIdx]?.cons || [];
    handleUpdate(
      optIdx,
      "cons",
      current.filter((_, i) => i !== conIdx)
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {options.map((opt, idx) => {
        const nameErr = fieldErrors[`options[${idx}].name`];
        const descErr = fieldErrors[`options[${idx}].description`];

        return (
          <div
            key={idx}
            className="panel"
            style={{
              padding: "36px 20px 24px",
              backgroundColor: "var(--white)",
              position: "relative",
            }}
          >
            {/* Corner Chip */}
            <CornerChip
              text={`OPTION ${idx + 1}`}
              color={idx === 0 ? "blue" : idx === 1 ? "red" : "ink"}
              rotation={-1.5}
            />

            {/* Remove Option Button (top right) */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginBottom: "12px",
              }}
            >
              <button
                type="button"
                onClick={() => handleRemoveOption(idx)}
                disabled={options.length <= 2}
                className="btn-ghost"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "13px",
                  color: options.length <= 2 ? "var(--ink-30)" : "var(--red)",
                  cursor: options.length <= 2 ? "not-allowed" : "pointer",
                }}
              >
                <Trash2 size={15} strokeWidth={2.5} />
                <span>Remove Option</span>
              </button>
            </div>

            {/* Option Name Field */}
            <div className={`field ${nameErr ? "has-error" : ""}`}>
              <label htmlFor={`opt-name-${idx}`}>
                <span>Option Name</span>
                <span className="field-hint">e.g. MongoDB Atlas, Redis</span>
              </label>
              <input
                id={`opt-name-${idx}`}
                type="text"
                value={opt.name || ""}
                onChange={(e) => handleUpdate(idx, "name", e.target.value)}
                placeholder="Name this option"
              />
              {nameErr && (
                <div className="field-error" aria-live="polite">
                  <span className="field-error-icon">!</span>
                  <span>{nameErr}</span>
                </div>
              )}
            </div>

            {/* Option Description Field */}
            <div className={`field ${descErr ? "has-error" : ""}`}>
              <label htmlFor={`opt-desc-${idx}`}>
                <span>Description (Optional)</span>
              </label>
              <textarea
                id={`opt-desc-${idx}`}
                rows={2}
                value={opt.description || ""}
                onChange={(e) => handleUpdate(idx, "description", e.target.value)}
                placeholder="What did this approach entail?"
                style={{ minHeight: "80px" }}
              />
              {descErr && (
                <div className="field-error" aria-live="polite">
                  <span className="field-error-icon">!</span>
                  <span>{descErr}</span>
                </div>
              )}
            </div>

            {/* Pros and Cons Row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "20px",
                marginTop: "16px",
                borderTop: "2px dashed var(--ink-30)",
                paddingTop: "20px",
              }}
            >
              {/* PROS (Blue) */}
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontFamily: "var(--font-display)",
                    fontSize: "13px",
                    color: "var(--blue)",
                    marginBottom: "10px",
                    textTransform: "uppercase",
                  }}
                >
                  <PlusSquare size={16} strokeWidth={3} />
                  <span>PROS ({opt.pros?.length || 0}/10)</span>
                </div>

                {/* Pros Input */}
                <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                  <input
                    type="text"
                    value={proInputs[idx] || ""}
                    onChange={(e) =>
                      setProInputs({ ...proInputs, [idx]: e.target.value })
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddPro(idx);
                      }
                    }}
                    placeholder="Add a pro and press Enter"
                    style={{
                      height: "36px",
                      padding: "0 10px",
                      fontSize: "14px",
                      border: "2px solid var(--ink)",
                      borderRadius: "6px",
                      flex: 1,
                    }}
                    disabled={(opt.pros?.length || 0) >= 10}
                  />
                  <button
                    type="button"
                    onClick={() => handleAddPro(idx)}
                    disabled={(opt.pros?.length || 0) >= 10}
                    className="btn btn-sm btn-blue press"
                    style={{ height: "36px", padding: "0 10px" }}
                    aria-label="Add pro"
                  >
                    <Plus size={16} strokeWidth={3} />
                  </button>
                </div>

                {/* Pros Chips */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {(opt.pros || []).map((pro, pIdx) => (
                    <span
                      key={pIdx}
                      style={{
                        backgroundColor: "var(--paper)",
                        border: "2px solid var(--ink)",
                        borderRadius: "999px",
                        padding: "3px 10px",
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "var(--ink)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <span>{pro}</span>
                      <button
                        type="button"
                        onClick={() => handleRemovePro(idx, pIdx)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "var(--red)",
                          padding: 0,
                          display: "flex",
                        }}
                        aria-label={`Remove pro: ${pro}`}
                      >
                        <X size={13} strokeWidth={3} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* CONS (Red) */}
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontFamily: "var(--font-display)",
                    fontSize: "13px",
                    color: "var(--red)",
                    marginBottom: "10px",
                    textTransform: "uppercase",
                  }}
                >
                  <MinusSquare size={16} strokeWidth={3} />
                  <span>CONS ({opt.cons?.length || 0}/10)</span>
                </div>

                {/* Cons Input */}
                <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                  <input
                    type="text"
                    value={conInputs[idx] || ""}
                    onChange={(e) =>
                      setConInputs({ ...conInputs, [idx]: e.target.value })
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCon(idx);
                      }
                    }}
                    placeholder="Add a con and press Enter"
                    style={{
                      height: "36px",
                      padding: "0 10px",
                      fontSize: "14px",
                      border: "2px solid var(--ink)",
                      borderRadius: "6px",
                      flex: 1,
                    }}
                    disabled={(opt.cons?.length || 0) >= 10}
                  />
                  <button
                    type="button"
                    onClick={() => handleAddCon(idx)}
                    disabled={(opt.cons?.length || 0) >= 10}
                    className="btn btn-sm btn-red press"
                    style={{ height: "36px", padding: "0 10px" }}
                    aria-label="Add con"
                  >
                    <Plus size={16} strokeWidth={3} />
                  </button>
                </div>

                {/* Cons Chips */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {(opt.cons || []).map((con, cIdx) => (
                    <span
                      key={cIdx}
                      style={{
                        backgroundColor: "var(--paper)",
                        border: "2px solid var(--ink)",
                        borderRadius: "999px",
                        padding: "3px 10px",
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "var(--ink)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <span>{con}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCon(idx, cIdx)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "var(--red)",
                          padding: 0,
                          display: "flex",
                        }}
                        aria-label={`Remove con: ${con}`}
                      >
                        <X size={13} strokeWidth={3} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Add Option Button */}
      <div style={{ display: "flex", justifyContent: "flex-start" }}>
        <button
          type="button"
          onClick={handleAddOption}
          disabled={options.length >= 10}
          className="btn btn-white press"
        >
          <Plus size={18} strokeWidth={3} />
          <span>Add Option ({options.length}/10)</span>
        </button>
      </div>
    </div>
  );
}
