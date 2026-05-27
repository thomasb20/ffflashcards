// Backend code for the Cloudflare Worker that can accept requests and return information from bindings.
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Helper: hash a password
    async function hashPassword(password) {
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(byte => byte.toString(16).padStart(2, "0")).join("");
    }

    // Helper: generate a token for the session
    function generateToken(username){
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2,11);
      return `${username}:${timestamp}:${random}`;
    }

    // Helper: verify token format
    function verifyToken(token) {
      const parts = token.split(":");
      if (parts.length !== 3) return null;
      return parts[0]; // Return username
    }

    // Helper: get token from header
    function getAuthToken(request){
      const authHeader = request.headers.get("Authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
      return authHeader.substring(7);
    }
    
    // Test
    if (url.pathname === "/test") {
      return new Response("Test" + await env.examentracker_db.get("data"));
    }

    if (url.pathname === "/get-version") {
      const { id: versionId, tag: versionTag, timestamp: versionTimestamp } = env.CF_VERSION_METADATA;
      let croppedId = versionId.slice(0, 8);
      return new Response(`${croppedId}`);
    }
    
    // Sign Up
    if (url.pathname === "/register" && request.method === "POST") {
      try {
        const { username, password } = await request.json();

        if (!username || !password) {
          return new Response(JSON.stringify({ error: "Username and password are required." }), { status: 400 });
        }

        // Check if user already exists
        const existingUser = await env.examentracker_db.get(`users:${username}`);
        if (existingUser) {
          return new Response(JSON.stringify({ error: "Username is already in use." }), { status: 400 });
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Save user
        const user = { username, password: hashedPassword };
        await env.examentracker_db.put(`users:${username}`, JSON.stringify(user));

        // Create empty userdata
        const defaultData = {
          flashcards: []
        };
        await env.examentracker_db.put(`user-data:${username}`, JSON.stringify(defaultData));

        return new Response(JSON.stringify({ success: true,message: "Registration successful." }));
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 400 });
      }
    }

    // Login
    if (url.pathname === "/login" && request.method === "POST") {
      try {
        const { username, password } = await request.json();

        if (!username || !password) {
          return new Response(JSON.stringify({ error: "Username and password are required." }), { status: 400 });
        }

        // Get user
        const userJson = await env.examentracker_db.get(`users:${username}`);
        if (!userJson) {
          return new Response(JSON.stringify({ error: "Invalid username or password." }), { status: 401 });
        }

        const user = JSON.parse(userJson);

        // Hash password and compare

        const hashedPassword = await hashPassword(password);
        if (hashedPassword !== user.password) {
          return new Response(JSON.stringify({ error: "Invalid username or password." }), { status: 401 });
        }

        // Generate token
        const token = generateToken(username);
        return new Response(JSON.stringify({ success: true, token, username }));
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 400 });
      }
    }

    if (url.pathname === "/get-data" && request.method === "GET") {
      const token = getAuthToken(request);
      if (!token) {
        return new Response(JSON.stringify({ error: "Token is required." }), { status: 401 });
      }

      const username = verifyToken(token);
      if (!username) {
        return new Response(JSON.stringify({ error: "Invalid token." }), { status: 401 });
      }

      const dataJson = await env.examentracker_db.get(`user-data:${username}`);
      if (!dataJson) {
        return new Response(JSON.stringify({ error: "No data found for this user." }), { status: 404 });
      }

      const data = JSON.parse(dataJson);
      return new Response(JSON.stringify(data));
    }

    if (url.pathname === "/update-data" && request.method === "POST") {
      const token = getAuthToken(request);
      if (!token) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
      }

      const username = verifyToken(token);
      if (!username) {
        return new Response(JSON.stringify({ error: "Invalid token" }), { status: 401 });
      }

      try {
        const newData = await request.json();
        await env.examentracker_db.put(`user-data:${username}`, JSON.stringify(newData));
        return new Response(JSON.stringify({ success: true, message: "Data saved" }));
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 400 });
      }
    }

    return new Response("Not found", { status: 404 });
  }
}