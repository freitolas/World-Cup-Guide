import { NAME } from '../voice.js';

// THE AI's wordmark + all-seeing eye. Same identity everywhere.
export default function AiMark({ showName = true }) {
  return (
    <span className="aimark">
      <span className="eye" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 64 64">
          <ellipse cx="32" cy="32" rx="22" ry="13" fill="none" stroke="#4cc2ff" strokeWidth="4" />
          <circle cx="32" cy="32" r="7" fill="#4cc2ff" />
          <circle cx="32" cy="32" r="2.5" fill="#07090f" />
        </svg>
      </span>
      {showName && <span className="name">{NAME}</span>}
    </span>
  );
}
