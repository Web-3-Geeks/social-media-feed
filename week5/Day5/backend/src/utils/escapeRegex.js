// Makes user text safe to put inside a RegExp: ".*" or "(" are matched as
// plain characters instead of breaking (or slowing down) the query.
export const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
