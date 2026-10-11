
const COOKIE = "birthday_auth";
const LOGIN = "/__birthday-login";
const PASSWORD_PAGE = "/password.html";
const DAY = 86400;

function html(message = "") {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>A Little Secret ♡</title>
<style>
*{box-sizing:border-box}
body{margin:0;min-height:100vh;display:grid;place-items:center;
padding:24px;background:#F5EEE2;color:#604448;
font-family:Georgia,serif}
main{width:min(100%,600px);padding:40px 28px;text-align:center;
background:#FFFDF8;border:1px solid #E8DCCE}
h1{font-size:42px;font-weight:normal}
h1 span{color:#BD737F;font-style:italic}
p{font:16px/1.8 Arial,sans-serif;color:#896F6D}
input,button{width:100%;padding:15px;margin-top:14px;font-size:16px}
input{border:1px solid #D7B8B4;background:#FFFDF8}
button{border:0;border-radius:30px;background:#BD737F;color:white;cursor:pointer}
.error{color:#A96170}
</style>
</head>
<body><main>
<p>A LITTLE WORLD, JUST FOR YOU</p>
<h1>A Little<br><span>Secret.</span> ♡</h1>
<p>This little corner of the internet is just for you. ❤️</p>
<p>Enter our secret password to open your birthday surprise.</p>
${message ? `<p class="error">${message}</p>` : ""}
<form method="post" action="${LOGIN}">
<input type="password" name="password" required
autocomplete="current-password" placeholder="Enter our secret password">
<button type="submit">Unlock Your Surprise ♡</button>
</form>
<p>made with love, just for you ✨</p>
</main></body></html>`;
}

function page(body, status = 200, headers = {}) {
  return new Response(body, {
    status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      ...headers
    }
  });
}

function redirect(path, cookie) {
  const headers = {
    location: path,
    "cache-control": "no-store"
  };
  if (cookie) headers["set-cookie"] = cookie;
  return new Response(null, { status: 303, headers });
}

async function hmac(value, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC", key, new TextEncoder().encode(value)
  );
  return Array.from(new Uint8Array(signature), b =>
    b.toString(16).padStart(2, "0")
  ).join("");
}

async function checkCookie(token, secret) {
  if (!token) return false;

  const parts = token.split(".");
  if (parts.length !== 2 || !/^\d+$/.test(parts[0])) return false;

  const expiry = Number(parts[0]);
  if (!Number.isSafeInteger(expiry) ||
      expiry <= Math.floor(Date.now() / 1000)) return false;

  const expected = await hmac(parts[0], secret);
  if (expected.length !== parts[1].length) return false;

  let difference = 0;
  for (let i = 0; i < expected.length; i++) {
    difference |= expected.charCodeAt(i) ^ parts[1].charCodeAt(i);
  }
  return difference === 0;
}

export default async function handler(request, context) {
  const secret = Netlify.env.get("PROTECTED_PAGE_PASSWORD");

  if (!secret) {
    return page("Site protection is not configured.", 503);
  }

  const url = new URL(request.url);

  if (url.pathname === LOGIN && request.method === "POST") {
    let form;
    try {
      form = await request.formData();
    } catch {
      return page(html("Please try again."), 400);
    }

    const supplied = form.get("password");
    if (typeof supplied !== "string" || supplied.length > 1024) {
      return page(html("Please enter the correct password."), 401);
    }

    const a = new Uint8Array(await crypto.subtle.digest(
      "SHA-256", new TextEncoder().encode(supplied)
    ));
    const b = new Uint8Array(await crypto.subtle.digest(
      "SHA-256", new TextEncoder().encode(secret)
    ));

    let difference = 0;
    for (let i = 0; i < a.length; i++) difference |= a[i] ^ b[i];

    if (difference !== 0) {
      return page(html("That password doesn't look right. Try again ❤️"), 401);
    }

    const expiry = String(Math.floor(Date.now() / 1000) + DAY);
    const token = expiry + "." + await hmac(expiry, secret);

    return redirect("/", `${COOKIE}=${token}; Path=/; Max-Age=${DAY}; HttpOnly; Secure; SameSite=Strict`);
  }

  const cookies = request.headers.get("cookie") || "";
  const match = cookies.match(/(?:^|;\s*)birthday_auth=([^;]*)/);
  const authenticated = await checkCookie(match?.[1] || "", secret);

  if (authenticated) return context.next();

  if (url.pathname === PASSWORD_PAGE && request.method === "GET") {
    return context.next();
  }

  if (request.method === "GET" || request.method === "HEAD") {
    return redirect(PASSWORD_PAGE);
  }

  return page("Please unlock the birthday surprise first.", 401);
}

export const config = {
  path: "/*"
};
