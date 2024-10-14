import type { Runtime } from './types'
import { readFile } from 'node:fs/promises'
import { env } from 'node:process'
import { captureException as sentryCaptureException } from '@sentry/node'
import logger from './logger'

/**
 * @type {string}
 */
const prefix: string = 'Invariant failed'
export const API_PREFIX = '/api'

/**
 * @export
 * @param {boolean} condition
 * @param {?(string | (() => string))} [message]
 */
export function invariant(
  condition: boolean,
  message?: string | (() => string),
): Error | undefined {
  if (condition) {
    return
  }
  const provided: string | undefined = typeof message === 'function'
    ? message()
    : message
  const value: string = provided ? `${prefix}: ${provided}` : prefix
  throw new Error(value)
}

/**
 * @export
 * @param {(Error | string | unknown)} errorMessage
 */
export function captureException(errorMessage: Error | string | unknown): void {
  const errMsg = errorMessage instanceof Error
    ? errorMessage.message
    : errorMessage as string
  invariant(!isProd(), () => { // false = show error
    logger.error(errMsg)
    sentryCaptureException(errMsg)
    return errMsg
  })
}

/**
 * Determines the platform for test execution.
 */
export function getRuntime(): Runtime {
  if (typeof globalThis.Deno !== 'undefined') {
    return 'deno'
  }
  if (typeof globalThis?.Bun !== 'undefined') {
    return 'bun'
  }

  return 'node'
}

/**
 * @export
 * @returns boolean
 */
export function isDev(): boolean {
  return env.NODE_ENV === 'development' || env.NODE_ENV === 'dev'
}

/**
 * @export
 * @returns boolean
 */
export function isTest(): boolean {
  return env.NODE_ENV === 'test' || env.NODE_ENV === 'testing'
}

/**
 * @export
 * @returns boolean
 */
export function isProd(): boolean {
  return env.NODE_ENV === 'production' || env.NODE_ENV === 'prod'
}

/**
 * @export
 * @returns string
 */
export function environment(): string {
  return env.NODE_ENV || 'development'
}

/**
 * @type {{ 200: number; 401: number; 500: number; 422: number; }\}
 */
export const HTTP_STATUS_CODE = {
  200: 200,
  401: 401,
  500: 500,
  422: 422,
}

export async function getOpenAPISpec(): Promise<string> {
  return await readFile('./src/openapi.yaml', { encoding: 'utf8' })
}

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
