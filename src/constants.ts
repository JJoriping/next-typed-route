export const dynamicSegmentPatterns = {
  normal: /\/\[(\w+?)]/g,
  catchAll: /\/\[\.{3}(\w+?)]/g,
  optionalCatchAll: /\/\[\[\.{3}(\w+?)]]/g
};