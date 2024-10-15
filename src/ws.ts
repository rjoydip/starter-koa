import type { THooksMapper, UserInput } from './types'
import { defineHooks } from 'crossws'
import crossws from 'crossws/adapters/node'
import queryString from 'query-string'
import hooks from './hooks'
import logger from './logger'
import { captureException } from './utils'

const hooksMapper: {
  [x in THooksMapper]: (id?: number | null, input?: UserInput) => Promise<any>
} = {
  health: async () => await hooks.callHook('health'),
  _metrics: async () => await hooks.callHook('_metrics'),
  _meta: async () => await hooks.callHook('_meta'),
  getUsers: async () => await hooks.callHook('getUsers'),
  getUser: async id => await hooks.callHook('getUser', id),
  createUser: async (_, input) => await hooks.callHook('createUser', input),
  updateUser: async (id, input) => await hooks.callHook('updateUser', id, input),
  deleteUser: async id => await hooks.callHook('deleteUser', id),
}

export const ws = crossws({
  hooks: defineHooks({
    open(peer) {
      logger.log(`[ws] open: ${peer.id}`)
    },

    async message(peer, message) {
      logger.log('[ws] message', peer.id, message.text())
      const qs = queryString.parse(message.text(), {
        arrayFormat: 'bracket-separator',
        arrayFormatSeparator: '|',
        parseNumbers: true,
        parseBooleans: true,
        types: {
          method: 'string',
          id: 'number',
          input: 'string',
        },
      })
      const { method, id, ...input } = qs
      if (method === 'ping') {
        peer.send('pong')
      }
      else if (Object.keys(hooksMapper).includes(method as THooksMapper)) {
        logger.log('Hook matched:', method)
        if (input) {
          peer.send(await hooksMapper[method as THooksMapper](id as number, input))
        }
      }
      else {
        logger.log(`Hooks not matched: ${method}`)
      }
    },

    close(peer, event) {
      logger.log('[ws] close', peer.id, event)
    },

    error(peer, error) {
      logger.log('[ws] error', peer.id, error)
      captureException(`[${peer.id}]: ${error}`)
    },

    upgrade(req) {
      logger.log(`[ws] upgrading ${req.url}...`)
      return {
        headers: {},
      }
    },
  }),
})

export function wsTemplete(opts: { sse?: boolean } = { sse: false }): string {
  return /* html */ `
  <!doctype html>
  <html lang="en" data-theme="dark">
    <head>
      <title>WS Test Page</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        body {
          background-color: #1a1a1a;
        }
      </style>
      <script type="module">
        import {
          createApp,
          reactive,
          nextTick,
        } from "https://esm.sh/petite-vue@0.4.1";

        const store = reactive({
          message: "",
          messages: [],
        });

        const scroll = () => {
          nextTick(() => {
            const el = document.querySelector("#messages");
            el.scrollTop = el.scrollHeight;
            el.scrollTo({
              top: el.scrollHeight,
              behavior: "smooth",
            });
          });
        };

        const format = async () => {
          for (const message of store.messages) {
            if (!message._fmt && message.text.startsWith("{")) {
              message._fmt = true;
              const { codeToHtml } = await import("https://esm.sh/shiki@1.0.0");
              const str = JSON.stringify(JSON.parse(message.text), null, 2);
              message.formattedText = await codeToHtml(str, {
                lang: "json",
                theme: "dark-plus",
              });
            }
          }
        };

        const log = (user, ...args) => {
          console.log("[ws]", user, ...args);
          store.messages.push({
            text: args.join(" "),
            formattedText: "",
            user: user,
            date: new Date().toLocaleString(),
          });
          scroll();
          format();
        };

        let _send = () => {};

        let ws;
        const connectWS = async () => {
          const isSecure = location.protocol === "https:";
          const url = (isSecure ? "wss://" : "ws://") + location.host + "/";
          if (ws) {
            log("ws", "Closing previous connection before reconnecting...");
            ws.close();
            _send = () => {};
            clear();
          }

          log("ws", "Connecting to", url, "...");
          ws = new WebSocket(url);

          ws.addEventListener("message", async (event) => {
            const message = typeof event.data === "string" ? event.data : await event.data.text();
            log(
              "",
              typeof message === "string" ? message : JSON.stringify(message),
            );
          });

          await new Promise((resolve) => ws.addEventListener("open", resolve));
          _send = (message) => ws.send(message);
          log("ws", "Connected!");
        };

        let sse;
        const connectSSE = async () => {
          const url = "/_sse";
          if (sse) {
            log("sse", "Closing previous connection before reconnecting...");
            sse.close();
            clear();
            send = () => {};
          }

          log("sse", "Connecting to", url, "...");
          sse = new EventSource(url);

          sse.addEventListener("crossws-id", (event) => {
            const peerId = event.data;

            const sendWithFetch = _send = (message) => fetch(url, {
              method: 'POST',
              headers: { 'x-ws-id': peerId },
              body: message,
            }).catch((error) => {
              log("sse", "Cannot send message:", error);
            });

            fetch(url, {
               method: 'POST',
               duplex: 'half',
               headers: {
                'content-type': 'application/octet-stream',
                'x-ws-id': event.data
               },
               body: new ReadableStream({
                  start(controller) {
                    _send = (message) => {
                      controller.enqueue(message);
                    }
                  },
               }).pipeThrough(new TextEncoderStream()),
            }).catch((error) => {
              _send = sendWithFetch;
            });
          });

          sse.addEventListener("message", async (event) => {
            const data = event.data;
            const { user = "system", message = "" } = data.startsWith("{")
              ? JSON.parse(data)
              : { message: data };
            log(
              user,
              typeof message === "string" ? message : JSON.stringify(message),
            );
          });

          log("sse", "Connected!");
        }

        const connect = ${opts.sse ? 'connectSSE' : 'connectWS'};

        const clear = () => {
          store.messages.splice(0, store.messages.length);
          log("system", "previous messages cleared");
        };

        const send = () => {
          console.log("sending message...", store.message);
          if (store.message) {
            _send(store.message);
          }
          store.message = "";
        };

        const ping = () => {
          log("ws", "Sending ping");
          _send("method=ping");
        };

        createApp({
          store,
          send,
          ping,
          clear,
          connect,
          rand: Math.random(),
        }).mount();

        await connect();
      </script>
    </head>
    <body class="h-screen flex flex-col justify-between">
      <main v-scope="{}">
        <!-- Messages -->
        <div id="messages" class="flex-grow flex flex-col justify-end px-4 py-8">
          <div class="flex items-center mb-4" v-for="message in store.messages">
            <div class="flex flex-col">
              <p class="text-gray-500 mb-1 text-xs ml-10">{{ message.user }}</p>
              <div class="flex items-center">
                <img
                  :src="'https://www.gravatar.com/avatar/' + encodeURIComponent(message.user + rand) + '?s=512&d=monsterid'"
                  alt="Avatar"
                  class="w-8 h-8 rounded-full"
                />
                <div class="ml-2 bg-gray-800 rounded-lg p-2">
                  <p
                    v-if="message.formattedText"
                    class="overflow-x-scroll"
                    v-html="message.formattedText"
                  ></p>
                  <p v-else class="text-white">{{ message.text }}</p>
                </div>
              </div>
              <p class="text-gray-500 mt-1 text-xs ml-10">{{ message.date }}</p>
            </div>
          </div>
        </div>

        <!-- Chatbox -->
        <div
          class="bg-gray-800 px-4 py-2 flex items-center justify-between fixed bottom-0 w-full"
        >
          <div class="w-full min-w-6">
            <input
              type="text"
              placeholder="Type your message..."
              class="w-full rounded-l-lg px-4 py-2 bg-gray-700 text-white focus:outline-none focus:ring focus:border-blue-300"
              @keydown.enter="send"
              v-model="store.message"
            />
          </div>
          <div class="flex">
            <button
              class="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4"
              @click="send"
            >
              Send
            </button>
            <button
              class="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4"
              @click="ping"
            >
              Ping
            </button>
            <button
              class="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4"
              @click="connect"
            >
              Reconnect
            </button>
            <button
              class="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-r-lg"
              @click="clear"
            >
              Clear
            </button>
          </div>
        </div>
      </main>
    </body>
  </html>
  `.trim()
}
