export const THEME_STORAGE_KEY = "wwk-appearance";

export type Appearance = "light" | "dark";

/**
 * Applied before first paint so a stored or system preference never flashes the
 * wrong theme. Kept as a string because it has to run inline, ahead of hydration.
 */
export const THEME_BOOT_SCRIPT = `(function(){try{var k="${THEME_STORAGE_KEY}";var s=localStorage.getItem(k);var d=s==="dark"||(s!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);}catch(e){}})();`;
