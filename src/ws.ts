import type { UserInput } from './schema.ts'
import type { THooksMapper } from './types.ts'
import { defineHooks } from 'crossws'
import crossws from 'crossws/adapters/node'
import queryString from 'query-string'
import logger from './logger.ts'
import { resolvers } from './resolvers.ts'
import { captureException } from './utils.ts'

// Resolvers for mutations and queries
const { Mutation, Query } = resolvers

// Mapper for hooks that maps actions to corresponding functions
const hooksMapper: Record<THooksMapper, (id: string, input: UserInput) => Promise<any>> = {
  getUsers: async () => await Query.getUsers(),
  getUser: async id => await Query.getUser(null, { id }),
  createUser: async (_, input) => await Mutation.createUser(null, { input }),
  updateUser: async (id, input) => await Mutation.updateUser(null, { id, input }),
  deleteUser: async id => await Mutation.deleteUser(null, { id }),
}

// WebSocket server instance
export const ws = crossws({
  hooks: defineHooks({
    open(peer) {
      logger.log(`[ws] open: ${peer.id}`)
    },

    async message(peer, message) {
      logger.log('[ws] message', peer.id, message.text())
      const qs = queryString.parse(message.text(), {
        parseNumbers: true,
        parseBooleans: true,
        types: {
          action: 'string',
          id: 'number',
        },
      })
      const { action, id, ...input } = qs
      if (action === 'ping') {
        peer.send('pong', { compress: true })
      }
      else if (Object.keys(hooksMapper).includes(action as THooksMapper)) {
        logger.log('Hook matched:', action)
        peer.send(await hooksMapper[action as THooksMapper](id as string, input as unknown as UserInput), { compress: true })
      }
      else {
        logger.log(`Hooks not matched: ${action}`)
        peer.send('invalid', { compress: true })
      }
    },

    close(peer, event) {
      logger.log('[ws] close', peer.id, event)
    },

    error(peer, error) {
      logger.log('[ws] error', peer.id, error)
      captureException(`[${peer.id}]: ${error}`)
    },
  }),
})

/**
 * Generates an HTML template for the WebSocket playground.
 *
 * @export
 * @param {{ sse?: boolean }} [opts] - Options for the template.
 * @returns {string} HTML template
 */
export function wsTemplate(opts: { sse?: boolean } = { sse: false }): string {
  return /* html */ `
  <!doctype html>
  <html lang="en" data-theme="dark">
    <head>
      <title>WS Playground</title>
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

          sse.addEventListener("ws", (event) => {
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
          _send("action=ping");
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
