// The navbar badge listens here, so marking notifications as read on the
// notifications page updates the badge right away, without another request.
const EVENT = "unread-count-change";

export function emitUnreadCount(count) {
  window.dispatchEvent(new CustomEvent(EVENT, { detail: count }));
}

export function onUnreadCountChange(handler) {
  const listener = (event) => handler(event.detail);
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}
