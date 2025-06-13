[![stability-beta](https://img.shields.io/badge/stability-beta-33bbff.svg)](https://github.com/mkenney/software-guides/blob/master/STABILITY-BADGES.md#beta)

## What is this?

This is somewhere to prototype svelte components. It is very much a work in progress. If you want to copy the components folder into the  components folder in your existing project...

degit guardian/svelte-components-prototyping/src/lib/components/guardian src/lib/components/guardian

## How to use the template

### Prerequisites

The template is compatible with Node 16+. You can install new versions of node using [NVM](https://github.com/nvm-sh/nvm#installing-and-updating).

### Getting started

1. Click the "Use this template" button on this page to create a new repository.
2. Clone the repo
3. Install dependencies: `npm install`

To start the dev server:

```
npm run dev
```

To build for production:

```
npm run build
```

## Project structure

The files that make up your interactive atom live in the `/src` directory. This is what a typical src directory looks like:

- `/assets`
- `/atoms`
- `/lib`

### Assets

The recommended place for putting any static assets (Images, JSON, etc.). These assets are shared between atoms and can be referenced using `__assetsPath__`. For example:

```html
<img src="__assetsPath__/guardian-logo.svg" alt="Guardian logo" />
```

The **assetsPath** string is automatically replaced with the correct path when running the dev server or building for production.

### Atoms

Each directory in the `/atoms` folder represents a single interactive atom. To create a new atom, duplicate an existing atom and give it a descriptive name.

When embedding multiple atoms on the same Composer page, make sure you use unique CSS IDs for each atom in their respective `main.html` files.

```html
<div id="some-unique-id">{{ html }}</div>
```

You will need to change this ID in `app.js` too.

```js
const app = new Atom({
  target: document.getElementById("some-unique-id"),
  hydrate: true,
  props: {},
})
```

### Lib

Source files that are shared by multiple atoms should be placed in the `/lib` folder. These files should be referenced using the `$lib` import alias. For example:

```js
import SharedComponent from "$lib/components/SharedComponent.svelte"
```

## Other features

### Using Svelte 5 or older versions

The default atom component ([Atom.svelte](src/atoms/default/components/Atom.svelte)) is a Svelte 5 component.

If you would prefer to use an older version of Svelte, you can! Svelte 5 was created to be a
backwards-compatible upgrade, so you can use older Svelte syntax (`export let prop`, `$: { //...
}`, etc) in `Atom.svelte` and other components without needing to change any settings.

However, you can't use syntax from _both_ Svelte 5 and Svelte 4 or older in the same component. Eg. you can't have `let { name = "atom" } = $props()` and `$: foo = index + 1`.

Read [this Svelte 5 documentation](https://svelte.dev/docs/svelte/v5-migration-guide) for more info.

### Dark mode

Ideally interactives should support dark mode. This project introduces some commonly-used variables that will switch value if the project is in dark mode. The color variables can be found in the `_colors.scss` file. The switch turning dark mode on or off is found in the [main.scss](https://github.com/guardian/interactive-atom-template-2023/blob/main/src/atoms/default/styles/main.scss) of the default atom.

The `main.scss` file above provides a simple background colour and text styles that should switch when in an app that is in dark mode. To disable this, just remove that code or make it more specific.

NB: the Guardian only supports dark mode on app, not web (as of July 2024).

To use these variables in css:

```
p {
     color: var(--primary-text-color);
}
```

To test on web, use the `App Article` template to view. This has the `.ios` and `.android` classes that trigger dark mode. You need to set your macbook to use dark mode: Apple Icon (top left of screen) > System Settings > Appearance > Dark mode.

NB: if you are using the [component library](https://github.com/guardian/interactive-component-library) in your project - it is advised to delete or disable the default \_colors.scss file in this repo. That's because the component also defines these variables and some switching code to detect if it is being run in dark mode. If you include both variable definitions, overrides could cause confusion about which definition wins out.

### Linting and formatting

ESLint and Prettier configurations are included in the project. To enforce those rules:

1. Open `.githooks/pre-commit` in a text editor
2. Uncomment this line: `# npx lint-staged`
3. Save the file

From that point on, ESLint and Prettier checks will run before every commit.

## Troubleshooting

### Using React modules with Preact breaks prerendering

If you want to use React modules with Preact, you need to set `ssr.noExternal` to `true` in `vite.config.js`. This ensures that import statements in dependencies are properly aliased to `preact/compat`.

See [Vite documentation](https://vitejs.dev/guide/ssr.html#ssr-externals) for more details.

## Supported browsers

A list of browsers that the guardian supports can be found here: [https://www.theguardian.com/help/recommended-browsers](https://www.theguardian.com/help/recommended-browsers)
