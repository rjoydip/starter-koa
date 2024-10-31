import type { ReferenceConfiguration } from '@scalar/types/legacy'

/**
 * Options for configuring the API Reference, which include a CDN URL and options inherited from ReferenceConfiguration.
 *
 * @export
 * @typedef {ApiReferenceOptions}
 * @property {string} [cdn] - Optional URL for the CDN from which the API Reference assets will be loaded.
 */
export type ApiReferenceOptions = ReferenceConfiguration & {
  cdn?: string
}

/**
 * Custom CSS for theming the API Reference interface. Defines light and dark themes with color schemes and specific UI components.
 *
 * @export
 * @constant {string} customThemeCSS - CSS styles for the API Reference theme.
 */
export const customThemeCSS = `
  /* Light mode theme variables */
  .light-mode {
    --scalar-color-1: #353535;
    --scalar-color-2: #555555;
    --scalar-color-3: #aeaeae;
    --scalar-color-accent: #259dff;
    --scalar-background-1: #fff;
    --scalar-background-2: #f7f7f7;
    --scalar-background-3: #dadada;
    --scalar-background-accent: #E0F5FF;
    --scalar-border-color: rgba(0, 0, 0, 0.1);
  }
  .dark-mode {
    --scalar-color-1: rgba(255, 255, 255, 0.9);
    --scalar-color-2: rgba(255, 255, 255, 0.62);
    --scalar-color-3: rgba(255, 255, 255, 0.44);
    --scalar-color-accent: #8ab4f8;
    --scalar-background-1: #1a1a1a;
    --scalar-background-2: #252525;
    --scalar-background-3: #323232;
    --scalar-background-accent: #8ab4f81f;
    --scalar-border-color: rgba(255, 255, 255, 0.1);
  }
  /* Sidebar styling for light and dark modes */
  .light-mode .t-doc__sidebar,
  .dark-mode .sidebar {
    --scalar-sidebar-background-1: var(--scalar-background-1);
    --scalar-sidebar-item-hover-background: var(--scalar-background-2);
    --scalar-sidebar-item-active-background: var(--scalar-background-accent);
    --scalar-sidebar-border-color: var(--scalar-border-color);
    --scalar-sidebar-color-1: var(--scalar-color-1);
    --scalar-sidebar-color-2: var(--scalar-color-2);
    --scalar-sidebar-color-active: var(--scalar-color-accent);
  }
  /* Button and color variables */
  .light-mode, .dark-mode {
    --scalar-button-1: rgb(49 53 56);
    --scalar-button-1-color: #fff;
    --scalar-color-green: #669900;
    --scalar-color-red: #dc4a68;
    --scalar-color-yellow: #edbe20;
    --scalar-color-blue: #0277aa;
    --scalar-color-orange: #fb892c;
    --scalar-color-purple: #5203d1;
  }
  :root {
    --scalar-radius: 3px;
    --scalar-radius-lg: 3px;
    --scalar-radius-xl: 3px;
  }
`

/**
 * Generates HTML for loading the API Reference configuration and script. Embeds configuration data as JSON in a `<script>` element.
 *
 * @export
 * @function apiReference
 * @param {ApiReferenceOptions} options - Configuration options for the API Reference.
 * @returns {string} The generated HTML string with the embedded configuration and script URL.
 */
export function apiReference(options: ApiReferenceOptions): string {
  const configData = JSON.stringify(options).split('"').join('&quot;')
  const specContent = options.spec?.content
    ? typeof options.spec.content === 'function'
      ? JSON.stringify(options.spec.content())
      : JSON.stringify(options.spec.content)
    : ''

  return `
      <script
        id="api-reference"
        type="application/json"
        data-configuration="${configData}">${specContent}</script>
      <script src="${
        options.cdn || 'https://cdn.jsdelivr.net/npm/@scalar/api-reference'
      }"></script>
  `
}

/**
 * Generates a complete HTML document for displaying API documentation with custom theming and embedded configuration.
 *
 * @export
 * @function apiDocs
 * @param {ApiReferenceOptions} options - Configuration options for the API Reference, including theme selection.
 * @returns {string} The HTML document string with head, body, and API Reference embedded.
 */
export function apiDocs(options: ApiReferenceOptions): string {
  return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>API Docs</title>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <style>${options.theme ? '' : customThemeCSS}</style>
        </head>
        <body>
          ${apiReference(options)}
        </body>
      </html>
  `
}
