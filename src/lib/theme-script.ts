export const THEME_STORAGE_KEY = "tiga-saudara-theme";

/**
 * Inline bootstrap that applies the persisted theme before first paint.
 * Shared by the root layout and the global not-found document so the two
 * copies can never drift apart.
 */
export const THEME_INIT_SCRIPT = `
  (function() {
    try {
      var stored = localStorage.getItem("${THEME_STORAGE_KEY}");
      var theme = stored === "light" || stored === "dark"
        ? stored
        : "light";
      document.documentElement.setAttribute("data-theme", theme);
    } catch (_) {
      document.documentElement.setAttribute("data-theme", "light");
    }
  })();
`;
