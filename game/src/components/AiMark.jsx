import { NAME } from '../voice.js';

// THE AI as the brass archive-machine: an engraved plate with an all-seeing
// dial. Same entity everywhere, now in its Wes Anderson cabinet.
export default function AiMark({ showName = true }) {
  return (
    <span className="aimark">
      <span className="plate" aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="20" fill="none" stroke="#5a4416" strokeWidth="2.5" />
          <ellipse cx="32" cy="32" rx="18" ry="10" fill="none" stroke="#5a4416" strokeWidth="2" />
          <circle cx="32" cy="32" r="6" fill="#3b2e21" />
          <circle cx="32" cy="32" r="2" fill="#d9b25a" />
        </svg>
      </span>
      {showName && <span className="name">{NAME}</span>}
    </span>
  );
}
