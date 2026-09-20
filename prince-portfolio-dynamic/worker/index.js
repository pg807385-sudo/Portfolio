const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" }
  });

const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,PUT,DELETE,OPTIONS",
  "access-control-allow-headers": "Content-Type"
};

function withCors(response) {
  const headers = new Headers(response.headers);
  Object.entries(corsHeaders).forEach(([k, v]) => headers.set(k, v));
  return new Response(response.body, { status: response.status, headers });
}

async function sign(value, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

async function makeSession(env) {
  const payload = btoa(JSON.stringify({ email: env.ADMIN_EMAIL, exp: Date.now() + 86400000 }));
  const signature = await sign(payload, env.SESSION_SECRET);
  return `${payload}.${signature}`;
}

async function isAdmin(request, env) {
  const cookie = request.headers.get("Cookie") || "";
  const match = cookie.match(/portfolio_session=([^;]+)/);
  if (!match || !env.SESSION_SECRET) return false;
  const [payload, signature] = match[1].split(".");
  if (!payload || !signature) return false;
  const expected = await sign(payload, env.SESSION_SECRET);
  if (expected !== signature) return false;
  try {
    const data = JSON.parse(atob(payload));
    return data.email === env.ADMIN_EMAIL && data.exp > Date.now();
  } catch {
    return false;
  }
}

async function body(request) {
  try { return await request.json(); } catch { return null; }
}

async function api(request, env, url) {
  if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  if (url.pathname === "/api/projects" && request.method === "GET") {
    const { results } = await env.DB.prepare(
      "SELECT * FROM projects ORDER BY featured DESC, id DESC"
    ).all();
    return json(results);
  }

  if (url.pathname === "/api/skills" && request.method === "GET") {
    const { results } = await env.DB.prepare(
      "SELECT * FROM skills ORDER BY category, id"
    ).all();
    return json(results);
  }

  if (url.pathname === "/api/contact" && request.method === "POST") {
    const b = await body(request);
    if (!b?.name || !b?.email || !b?.message) return json({error:"All fields are required."},400);
    if (String(b.message).length > 5000) return json({error:"Message is too long."},400);
    await env.DB.prepare(
      "INSERT INTO messages (name,email,message) VALUES (?,?,?)"
    ).bind(String(b.name).slice(0,100), String(b.email).slice(0,200), String(b.message)).run();
    return json({ok:true});
  }

  if (url.pathname === "/api/admin/login" && request.method === "POST") {
    const b = await body(request);
    if (!env.ADMIN_PASSWORD || !env.SESSION_SECRET) return json({error:"Admin secrets are not configured."},500);
    if (b?.email !== env.ADMIN_EMAIL || b?.password !== env.ADMIN_PASSWORD)
      return json({error:"Invalid credentials."},401);
    const session = await makeSession(env);
    return new Response(JSON.stringify({ok:true}), {
      headers: {
        "content-type":"application/json",
        "Set-Cookie": `portfolio_session=${session}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400`
      }
    });
  }

  if (url.pathname === "/api/admin/logout" && request.method === "POST") {
    return new Response(JSON.stringify({ok:true}), {
      headers: {"content-type":"application/json","Set-Cookie":"portfolio_session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0"}
    });
  }

  if (!(await isAdmin(request, env))) return json({error:"Unauthorized."},401);

  if (url.pathname === "/api/admin/me" && request.method === "GET") {
    return json({email: env.ADMIN_EMAIL});
  }

  if (url.pathname === "/api/admin/projects" && request.method === "POST") {
    const b = await body(request);
    if (!b?.title || !b?.description) return json({error:"Title and description are required."},400);
    const result = await env.DB.prepare(
      `INSERT INTO projects (title,category,description,tech,image_url,live_url,github_url,featured)
       VALUES (?,?,?,?,?,?,?,?)`
    ).bind(
      b.title, b.category || "Web", b.description, b.tech || "", b.image_url || "",
      b.live_url || "", b.github_url || "", b.featured ? 1 : 0
    ).run();
    return json({id: result.meta.last_row_id});
  }

  const projectMatch = url.pathname.match(/^\/api\/admin\/projects\/(\d+)$/);
  if (projectMatch && request.method === "DELETE") {
    await env.DB.prepare("DELETE FROM projects WHERE id=?").bind(projectMatch[1]).run();
    return json({ok:true});
  }

  if (url.pathname === "/api/admin/skills" && request.method === "POST") {
    const b = await body(request);
    if (!b?.name) return json({error:"Skill name is required."},400);
    await env.DB.prepare(
      "INSERT INTO skills (name,category,level) VALUES (?,?,?)"
    ).bind(b.name,b.category || "Other",Math.min(100,Math.max(0,Number(b.level)||80))).run();
    return json({ok:true});
  }

  const skillMatch = url.pathname.match(/^\/api\/admin\/skills\/(\d+)$/);
  if (skillMatch && request.method === "DELETE") {
    await env.DB.prepare("DELETE FROM skills WHERE id=?").bind(skillMatch[1]).run();
    return json({ok:true});
  }

  if (url.pathname === "/api/admin/messages" && request.method === "GET") {
    const { results } = await env.DB.prepare("SELECT * FROM messages ORDER BY id DESC").all();
    return json(results);
  }

  const messageMatch = url.pathname.match(/^\/api\/admin\/messages\/(\d+)\/read$/);
  if (messageMatch && request.method === "PUT") {
    await env.DB.prepare("UPDATE messages SET read=1 WHERE id=?").bind(messageMatch[1]).run();
    return json({ok:true});
  }

  return json({error:"Not found."},404);
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) {
      return withCors(await api(request, env, url));
    }
    return env.ASSETS.fetch(request);
  }
};
