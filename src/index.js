// Cloudflare Worker entrypoint for static assets
export default {
  async fetch(request, env) {
    // Serve static assets defined in wrangler.toml
    return env.ASSETS.fetch(request);
  }
};
