/**
 * @ripple-ts/adapter-vercel — Vercel adapter for the Ripple metaframework.
 *
 * This entry exposes only the runtime primitives (`serve`, `runtime`) that
 * `ripple.config.ts` and the production server need. It deliberately does
 * NOT re-export the build-time `adapt()` function: `adapt` pulls in
 * `@vercel/nft` and its dependency tree, and re-exporting it here would
 * drag that whole tracer into the deployed serverless bundle (anything
 * importing `serve`/`runtime` would transitively reach it).
 *
 * The Build Output generation step is available via the
 * `ripple-adapt-vercel` bin or, for programmatic use, the
 * `@ripple-ts/adapter-vercel/adapt` subpath export.
 */

export { runtime, serve } from '@ripple-ts/adapter-node';
