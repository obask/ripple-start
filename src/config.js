/**
 * Lightweight, build-tool-free entry point for `ripple.config.ts`.
 *
 * `ripple.config.ts` is bundled into the generated production server
 * entry. If the route classes and `defineConfig` are imported from the
 * main `@ripple-ts/vite-plugin` entry, they drag the entire Vite plugin
 * — and with it Vite, Rollup, esbuild and the Ripple compiler — into the
 * deployed serverless bundle when traced by deployment adapters.
 *
 * This module imports only `./routes.js` (which has no dependencies of
 * its own), so config files should import from
 * `@ripple-ts/vite-plugin/config` rather than from `@ripple-ts/vite-plugin`.
 */

/** @import { RippleConfigOptions } from '@ripple-ts/vite-plugin' */

export { RenderRoute, ServerRoute } from './routes.js';

/**
 * Identity helper that gives `ripple.config.ts` full type-checking and
 * editor DX. Returns the config object unchanged.
 *
 * @param {RippleConfigOptions} options
 * @returns {RippleConfigOptions}
 */
export function defineConfig(options) {
	return options;
}
