// Legacy of Empire — servidor das salas online.
// Cada sala (ex.: /ws/loe-1234) é um Durable Object que repassa as mensagens
// entre os jogadores conectados e mantém a lista de quem está na sala.

const ROOM_NAME = /^[a-z0-9][a-z0-9_.-]{0,47}$/;
const MAX_MSG = 8192;
const MAX_PEERS = 8;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/ws/")) {
      const name = url.pathname.slice(4);
      if (!ROOM_NAME.test(name)) return new Response("Sala inválida", { status: 400 });
      if (request.headers.get("Upgrade") !== "websocket") return new Response("Esperado WebSocket", { status: 426 });
      const stub = env.ROOMS.get(env.ROOMS.idFromName(name));
      return stub.fetch(request);
    }
    return env.ASSETS.fetch(request);
  },
};

export class Room {
  constructor(state) {
    this.state = state;
  }

  async fetch() {
    if (this.state.getWebSockets().length >= MAX_PEERS) return new Response("Sala cheia", { status: 403 });
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    const peer = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
    this.state.acceptWebSocket(server);
    server.serializeAttachment({ peer, presence: {} });
    server.send(JSON.stringify({ t: "hello", peer }));
    this.broadcastPeers();
    return new Response(null, { status: 101, webSocket: client });
  }

  webSocketMessage(ws, msg) {
    if (typeof msg !== "string" || msg.length > MAX_MSG) return;
    let m;
    try { m = JSON.parse(msg); } catch { return; }
    const me = ws.deserializeAttachment();
    if (!me) return;
    if (m.t === "p" && m.p && typeof m.p === "object") {
      me.presence = m.p;
      ws.serializeAttachment(me);
      this.broadcastPeers();
    } else if (m.t === "e" && typeof m.topic === "string") {
      const out = JSON.stringify({ t: "e", topic: m.topic.slice(0, 48), data: m.data, peer: me.peer });
      for (const other of this.state.getWebSockets()) {
        if (other !== ws) { try { other.send(out); } catch {} }
      }
    }
  }

  webSocketClose(ws) {
    try { ws.close(); } catch {}
    this.broadcastPeers(ws);
  }

  webSocketError(ws) {
    this.broadcastPeers(ws);
  }

  broadcastPeers(skip) {
    const socks = this.state.getWebSockets().filter((w) => w !== skip);
    const list = socks.map((w) => w.deserializeAttachment()).filter(Boolean);
    const out = JSON.stringify({ t: "peers", list });
    for (const w of socks) { try { w.send(out); } catch {} }
  }
}
