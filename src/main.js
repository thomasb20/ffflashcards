// Backend code for the Cloudflare Worker that can accept requests and return information from bindings.
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/get-version") {
      const { id: versionId, tag: versionTag, timestamp: versionTimestamp } = env.CF_VERSION_METADATA;
      let croppedId = versionId.slice(0, 8);
      return new Response(`${croppedId}`);
    }

    return new Response("Not found", { status: 404 });
  }
}