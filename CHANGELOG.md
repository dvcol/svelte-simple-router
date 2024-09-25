# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [1.1.2](https://github.com/dvcol/svelte-simple-router/compare/v1.1.1...v1.1.2) (2024-09-25)


### Bug Fixes

* **link:** correctly merge options with attributes ([bbaa295](https://github.com/dvcol/svelte-simple-router/commit/bbaa295e0c601a6f010d3568433f0f0d50f86484))

### [1.1.1](https://github.com/dvcol/svelte-simple-router/compare/v1.1.0...v1.1.1) (2024-09-24)


### Bug Fixes

* **lint:** adds svelte check to lint ci ([4c52f49](https://github.com/dvcol/svelte-simple-router/commit/4c52f493f4ba6f81bf314d3f8b7b6c03876921c4))
* **transition:** animate error & loading state tranisitons ([7f50d42](https://github.com/dvcol/svelte-simple-router/commit/7f50d422480c72c88c667b330dd63a2321e2659a))

## 1.1.0 (2024-09-24)


### Features

* **actions:** make actions reactive and fix query stripping ([82d7395](https://github.com/dvcol/svelte-simple-router/commit/82d73959158b4dedba76098e011c6d75744c823e))
* **active:** adds active action to highlight active route ([d3add37](https://github.com/dvcol/svelte-simple-router/commit/d3add37610bf0a81ca77a61bef22a3df573d28bb))
* **build:** adds demo build without sveltekit router ([5adfeb3](https://github.com/dvcol/svelte-simple-router/commit/5adfeb36558daf8ff3f613f5886bf8c682d07d13))
* **kit:** switch to svelte-kit ([802e6cf](https://github.com/dvcol/svelte-simple-router/commit/802e6cf472c559c0e7177c6170bc09c06ed71192))
* **link:** adds link action and support multiple hash fragments ([d040f17](https://github.com/dvcol/svelte-simple-router/commit/d040f17657d3f6e45c1a2ca7a68a5d24be9e281b))
* **link:** adds support for any element ([562157b](https://github.com/dvcol/svelte-simple-router/commit/562157b1185d1086a72b62988b7e06b82c35bf5a))
* **matcher:** allow route to have their own matcher ([77d7d5c](https://github.com/dvcol/svelte-simple-router/commit/77d7d5c27624cf7f7ef966a14895e660f0b0241e))
* **router:** add force push/replace to route in place ([7f7f863](https://github.com/dvcol/svelte-simple-router/commit/7f7f8638b7851ae917ee0c05d5583c95da3d7dc7))
* **router:** adds base support & hash mode ([72f8a2c](https://github.com/dvcol/svelte-simple-router/commit/72f8a2c37ef77b41d4761008cef29a3140c995f0))
* **router:** adds initial route & router typing ([77f7df0](https://github.com/dvcol/svelte-simple-router/commit/77f7df0aa97923351166131e57bcf74c1be7e553))
* **router:** adds route guard and redirect support ([d7ffdce](https://github.com/dvcol/svelte-simple-router/commit/d7ffdce07f529d6a724de45fb4653ecf7caa32d0))
* **router:** adds router base implementaiton ([43488ba](https://github.com/dvcol/svelte-simple-router/commit/43488ba5f2b71146a30dbf7a1d3da030cfcee26c))
* **router:** support dynamic routes & case-insensitive route names ([beee8f5](https://github.com/dvcol/svelte-simple-router/commit/beee8f547c76f3f919f7b70685021ef4539e7135))
* **router:** throw cancellation error when overriding navigation ([67df3e3](https://github.com/dvcol/svelte-simple-router/commit/67df3e32bc7d603b943916479ec94d5265930011))
* **RouterView:** adds support for event listeners ([4727868](https://github.com/dvcol/svelte-simple-router/commit/47278680619f2274ef8c38461a8fc70e74a49af5))
* **routing:** implement basic routing ([37511bc](https://github.com/dvcol/svelte-simple-router/commit/37511bcb12e4fe0eb79e8dc0733536abfb884466))
* scaffolding project ([9271fa0](https://github.com/dvcol/svelte-simple-router/commit/9271fa062bf5c7c2061ec96097b3a00727bf0f2c))
* **transition:** adds default transition and skip first option ([f1f35b6](https://github.com/dvcol/svelte-simple-router/commit/f1f35b6c27ac1fd62fb3fe2bf9834388c23e1e00))
* **transition:** adds route transition support ([e080444](https://github.com/dvcol/svelte-simple-router/commit/e0804444f4932903b8e2068853fde3b854b62fdf))


### Bug Fixes

* **build:** add missing exports ([4250798](https://github.com/dvcol/svelte-simple-router/commit/4250798774e4da3d69c8b983f1c711cf655ec73d))
* **resolve:** slice base path when resolving ([65c0100](https://github.com/dvcol/svelte-simple-router/commit/65c0100398a122fbbb588c1441fa9769237b531b))
* **RouteContainer:** adds props injection ([a240f4c](https://github.com/dvcol/svelte-simple-router/commit/a240f4cb6bb50732ab69a9bffbd1115f5c847d27))
* **router:** prevent double firing of listener on internal events ([efe8f0e](https://github.com/dvcol/svelte-simple-router/commit/efe8f0eef5645e1c8a5161c830a6d73d6abeafe9))
* **router:** stringify meta and inject title ([0447aa6](https://github.com/dvcol/svelte-simple-router/commit/0447aa6b152be15726a81be296eaff5da8f309e3))
* **router:** use SvelteMap to have route reactivity ([94ecd25](https://github.com/dvcol/svelte-simple-router/commit/94ecd2596cd6783a76d85a5f85b5840a13962108))
* **transition:** key transition to loadingKey ([1ca370a](https://github.com/dvcol/svelte-simple-router/commit/1ca370af1d892f8291d2464145c6a582eeee7438))
* **typescript:** adjust typing and expose loffer ([9378d41](https://github.com/dvcol/svelte-simple-router/commit/9378d412ab58342412010c52d82425642a15bf6a))
* **typescript:** fix typing issues in container ([cc9def5](https://github.com/dvcol/svelte-simple-router/commit/cc9def5fd68261a8bb8c5339865c3bbf7710859f))
* **web:** add base path to build process ([31f6202](https://github.com/dvcol/svelte-simple-router/commit/31f6202e4b34c525989eeaec6447dcc5c4f833fa))
