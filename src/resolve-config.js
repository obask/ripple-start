/**
 * Pure resolution / validation of a ripple.config.ts config object.
 *
 * `resolveRippleConfig` is the single source of truth for all config
 * validation and default values. Every consumer should receive a
 * `ResolvedRippleConfig` rather than applying ad-hoc defaults.
 *
 * This module is intentionally free of any build-tool dependency (no
 * Vite, no Rollup, no esbuild) so it can be imported by the production
 * server entry — via `@ripple-ts/vite-plugin/production` — without
 * dragging the build toolchain into the deployed serverless bundle.
 *
 * Loading the config *file* from disk (which needs Vite to transpile
 * the TypeScript) lives separately in `load-config.js`.
 */

/** @import { CompatFactoryConfig, RippleConfigOptions, ResolvedRippleConfig } from '@ripple-ts/vite-plugin' */

import { DEFAULT_OUTDIR } from './constants.js';

/**
 * @param {unknown} entry
 * @returns {entry is CompatFactoryConfig}
 */
function is_compat_descriptor(entry) {
	return !!entry && typeof entry === 'object' && 'from' in entry;
}

/**
 * @param {unknown} entry
 * @returns {entry is { __ripple_compat__: CompatFactoryConfig }}
 */
function is_compat_branded_entry(entry) {
	return (
		!!entry &&
		(typeof entry === 'function' || typeof entry === 'object') &&
		'__ripple_compat__' in entry &&
		is_compat_descriptor(entry.__ripple_compat__)
	);
}

/**
 * @param {string} kind
 * @param {unknown} entry
 * @returns {CompatFactoryConfig}
 */
function normalize_compat_entry(kind, entry) {
	if (is_compat_branded_entry(entry)) {
		entry = entry.__ripple_compat__;
	}

	if (!is_compat_descriptor(entry)) {
		throw new Error(
			`[@ripple-ts/vite-plugin] ripple.config.ts compat.${kind} must be either a compat descriptor, a compat factory, or an invoked compat entry.`,
		);
	}

	if (typeof entry.from !== 'string' || entry.from.length === 0) {
		throw new Error(
			`[@ripple-ts/vite-plugin] ripple.config.ts compat.${kind}.from must be a non-empty string.`,
		);
	}

	if (entry.factory !== undefined && typeof entry.factory !== 'string') {
		throw new Error(
			`[@ripple-ts/vite-plugin] ripple.config.ts compat.${kind}.factory must be a string when provided.`,
		);
	}

	return {
		from: entry.from,
		...(entry.factory ? { factory: entry.factory } : {}),
	};
}

/**
 * Validate a raw ripple config and apply all defaults.
 *
 * After this function returns every optional field carries its default
 * value so callers never need to use `??` / `||` fallbacks.
 *
 * The function is idempotent — passing an already-resolved config
 * through it again is safe and produces the same result.
 *
 * @param {RippleConfigOptions} raw - The user-provided config (from ripple.config.ts)
 * @param {{ requireAdapter?: boolean }} [options]
 * @returns {ResolvedRippleConfig}
 */
export function resolveRippleConfig(raw, options = {}) {
	const { requireAdapter = false } = options;

	// ------------------------------------------------------------------
	// Validate
	// ------------------------------------------------------------------
	if (!raw) {
		throw new Error(
			'[@ripple-ts/vite-plugin] ripple.config.ts must export a default config object.',
		);
	}

	if (requireAdapter) {
		if (!raw.adapter) {
			throw new Error(
				'[@ripple-ts/vite-plugin] Production builds require an `adapter` in ripple.config.ts. ' +
					'Install an adapter package (e.g. @ripple-ts/adapter-node) and set the `adapter` property.',
			);
		}

		if (!raw.adapter.runtime) {
			throw new Error(
				'[@ripple-ts/vite-plugin] The adapter in ripple.config.ts is missing the `runtime` property. ' +
					'Make sure your adapter exports runtime primitives.',
			);
		}
	}

	// ------------------------------------------------------------------
	// Apply defaults
	// ------------------------------------------------------------------
	return {
		build: {
			outDir: raw.build?.outDir ?? DEFAULT_OUTDIR,
			minify: raw.build?.minify,
			target: raw.build?.target,
		},
		adapter: raw.adapter,
		router: {
			routes: raw.router?.routes ?? [],
		},
		middlewares: raw.middlewares ?? [],
		compat: Object.fromEntries(
			Object.entries(raw.compat ?? {}).map(([kind, entry]) => [
				kind,
				normalize_compat_entry(kind, entry),
			]),
		),
		platform: {
			env: raw.platform?.env ?? {},
		},
		server: {
			trustProxy: raw.server?.trustProxy ?? false,
		},
	};
}
