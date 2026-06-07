import { NAME } from '../voice.js';

// THE AI's mark: a cold, all-seeing eye in clinical cyan. The same entity
// everywhere — omniscient, unbothered, always watching.
export default function AiMark({ showName = true }) {
  return (
    <span className="aimark">
      <span className="eye" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
        </svg>
      </span>
      {showName && <span className="name">{NAME}</span>}
    </span>
  );
}
