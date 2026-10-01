// Every FollowButton for the same user (profile header, search results, follower
// lists) listens here, so following someone in one place updates all of them.
const EVENT = "follow-change";

export function emitFollowChange(detail) {
  window.dispatchEvent(new CustomEvent(EVENT, { detail }));
}

export function onFollowChange(handler) {
  const listener = (event) => handler(event.detail);
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}
