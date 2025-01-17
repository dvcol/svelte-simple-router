# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.10.0](https://github.com/dvcol/svelte-simple-router/compare/v1.9.1...v1.10.0) (2025-01-17)


### Features

* **demo:** move to neo-svelte ([#20](https://github.com/dvcol/svelte-simple-router/issues/20)) ([8fd8413](https://github.com/dvcol/svelte-simple-router/commit/8fd841361f210ac96a3528eac7a42810858c8c10))

### [1.9.1](https://github.com/dvcol/svelte-simple-router/compare/v1.9.0...v1.9.1) (2025-01-03)


### Bug Fixes

* **routing:** adds debounce to routing state ([e483fa1](https://github.com/dvcol/svelte-simple-router/commit/e483fa15644110d538dfea923263f609de3f944c))
* **routing:** force component remount on navigation in place.  [#16](https://github.com/dvcol/svelte-simple-router/issues/16) ([ea87761](https://github.com/dvcol/svelte-simple-router/commit/ea877619b6b7d8c52cd872f49088fd7c73efde8a))

## [1.9.0](https://github.com/dvcol/svelte-simple-router/compare/v1.8.0...v1.9.0) (2024-12-06)


### Features

* **action:** adds link options to top level ([983284c](https://github.com/dvcol/svelte-simple-router/commit/983284c2276ec6b06efc6802a758250e12dbf33a))


### Bug Fixes

* **package:** adds missing export ([f5b6700](https://github.com/dvcol/svelte-simple-router/commit/f5b67003d5d7257fabd45c1345825411ad75701d))

## [1.8.0](https://github.com/dvcol/svelte-simple-router/compare/v1.7.3...v1.8.0) (2024-12-06)


### Features

* **action:** adds links wrapper. [#11](https://github.com/dvcol/svelte-simple-router/issues/11) ([7ad7baf](https://github.com/dvcol/svelte-simple-router/commit/7ad7baf781c638f4b48798db2a6c303944a2f64f))

### [1.7.3](https://github.com/dvcol/svelte-simple-router/compare/v1.7.2...v1.7.3) (2024-11-11)


### Bug Fixes

* **listen:** fix check error that skipped all sync events ([81ffd94](https://github.com/dvcol/svelte-simple-router/commit/81ffd9446a4b92eac2b804e65a2799263e928f89))

### [1.7.2](https://github.com/dvcol/svelte-simple-router/compare/v1.7.1...v1.7.2) (2024-11-11)


### Bug Fixes

* **link:** respect disabled state if any ([46708f4](https://github.com/dvcol/svelte-simple-router/commit/46708f4c188b8a7c3c37688c909f52f1fa49a3a8))

### [1.7.1](https://github.com/dvcol/svelte-simple-router/compare/v1.7.0...v1.7.1) (2024-11-08)


### Bug Fixes

* **transition:** bump dependencies and adjust transition container ([7eded1e](https://github.com/dvcol/svelte-simple-router/commit/7eded1ec3cc5522e401dff42732f6b5b2cb63090))

## [1.7.0](https://github.com/dvcol/svelte-simple-router/compare/v1.6.1...v1.7.0) (2024-11-06)


### Features

* **hooks:** allow overriding router/view instance in hooks ([a351085](https://github.com/dvcol/svelte-simple-router/commit/a35108565bc4de14ec053a38cdfdf9ff2f3e5d9a))

### [1.6.1](https://github.com/dvcol/svelte-simple-router/compare/v1.6.0...v1.6.1) (2024-10-27)


### Bug Fixes

* **debugger:** attach view to window for debugging ([4c06096](https://github.com/dvcol/svelte-simple-router/commit/4c0609648d8c425e42038d4ddbfd874dc04a8d05))
* **utils:** export toLazyComponent wrapper function ([3fb5e6a](https://github.com/dvcol/svelte-simple-router/commit/3fb5e6ae9c84c1a4e5e401bd85522ee27a4da803))

## [1.6.0](https://github.com/dvcol/svelte-simple-router/compare/v1.5.0...v1.6.0) (2024-10-27)


### Features

* **hooks:** adds listener hooks ([e72e45d](https://github.com/dvcol/svelte-simple-router/commit/e72e45de2729c04c29d9da52d35927eb34135949))
* **hooks:** rework context logic to create utility hooks ([d0dee9a](https://github.com/dvcol/svelte-simple-router/commit/d0dee9a8a97fc400d69ae84e8f37d9c42774ce2e))
* **loading:** adds loading event to subscribe in listeners ([5e90ad9](https://github.com/dvcol/svelte-simple-router/commit/5e90ad952864c6a9677bbda98fd84d418c16c7ae))
* **view:** adds beforeEach & parametrize viewTransitionName ([001efea](https://github.com/dvcol/svelte-simple-router/commit/001efea99b013e064511e95d37c25cb6f2a835f6))


### Bug Fixes

* **components:** refactor and simplify component tree ([ee9be72](https://github.com/dvcol/svelte-simple-router/commit/ee9be72c5a96fbaad6a14face0478bcc83af7f33))

## [1.5.0](https://github.com/dvcol/svelte-simple-router/compare/v1.4.0...v1.5.0) (2024-10-24)


### Features

* **dep:** bump to svelte 5 final release ([bf25d84](https://github.com/dvcol/svelte-simple-router/commit/bf25d84941c0987ae9db9ad7ce562f8b83b5bc61))


### Bug Fixes

* **transition:** wrap css in global following svelte compile changes ([61e5a3f](https://github.com/dvcol/svelte-simple-router/commit/61e5a3fa6fb5624798c484ca2e46db667c8e895c))

## [1.4.0](https://github.com/dvcol/svelte-simple-router/compare/v1.3.0...v1.4.0) (2024-10-16)


### Features

* **RouteView:** adds declarative route API for dynamically adding route ([6f9039b](https://github.com/dvcol/svelte-simple-router/commit/6f9039b484536fccb427cdb4f00c2fd94709b636))
* **RouteView:** adds support to snippet ([428eab8](https://github.com/dvcol/svelte-simple-router/commit/428eab87d47668dac96873e3979f24cb35dc417e))


### Bug Fixes

* **hash:** replace base when navigating in hash mode ([a8c00b1](https://github.com/dvcol/svelte-simple-router/commit/a8c00b13601a200294a74e8c226251b3096d9a10))
* **nested:** clear component when no component found ([e3ad994](https://github.com/dvcol/svelte-simple-router/commit/e3ad9940923c2877f2ed00ccbd5ac0dacd98260a))
* **options:** adds default routing options to routerinstance ([4f9abad](https://github.com/dvcol/svelte-simple-router/commit/4f9abad8a84d91c2da314aeab86e7a0ba8fc461f))
* **router:** correct typing & adds UT for sync strategy ([2184ace](https://github.com/dvcol/svelte-simple-router/commit/2184ace3abd70494a47ac2f572dd3ab739e2ab77))
* **sync:** allow replace of history state when syncing router ([4a2a7b3](https://github.com/dvcol/svelte-simple-router/commit/4a2a7b3dbd8db2c89311ed97b7400ad5b1a3b3d6))
* **url:** correctly parse path parameter when syncing ([e3e5f4d](https://github.com/dvcol/svelte-simple-router/commit/e3e5f4d952e5409b9a9e56ee639437a90f3a89f5))

## [1.3.0](https://github.com/dvcol/svelte-simple-router/compare/v1.2.0...v1.3.0) (2024-10-06)


### Features

* **routing:** add a routing snippet to routerView ([a9d3c30](https://github.com/dvcol/svelte-simple-router/commit/a9d3c30b533896089842d4679f304af61175f487))

## [1.2.0](https://github.com/dvcol/svelte-simple-router/compare/v1.1.2...v1.2.0) (2024-10-05)


### Features

* **redirect:** rework redirect flow and supports title param injection ([c73cd30](https://github.com/dvcol/svelte-simple-router/commit/c73cd30cd77b104443e88675900c385375d83175))
* **router:** push/replace state after in memory routing ([a589e28](https://github.com/dvcol/svelte-simple-router/commit/a589e28c0c5debf3cbce85507c2c00382f3c9325))
* **router:** rework navigation event & listeners ([dc914c2](https://github.com/dvcol/svelte-simple-router/commit/dc914c21bc162279ab79a280f74f87954a3e1148))
* **transition:** enable transition on every route change ([ee41f9d](https://github.com/dvcol/svelte-simple-router/commit/ee41f9d307422318dcd7828a365119ebafa8db75))


### Bug Fixes

* **active:** inverse matching logic & add UT ([4caa895](https://github.com/dvcol/svelte-simple-router/commit/4caa895315713889fc8f5a7f0803a3b33fb20f8b))
* **active:** use path instead of href for location matching ([add0a23](https://github.com/dvcol/svelte-simple-router/commit/add0a23d1b5d8903c8f7cc55ea22ab5cfdc97b91))
* **lazy:** add lazy import wrapper to explicit mark lazy components ([c1d0aff](https://github.com/dvcol/svelte-simple-router/commit/c1d0affac60750f6c3f2e5abcd99b455334fbec1))
* **lint:** fix eslint & svelte check errors ([f6e6996](https://github.com/dvcol/svelte-simple-router/commit/f6e6996380ebef93821876752caa03708e887f45))
* **logging:** pass log level to router instance ([1a673c0](https://github.com/dvcol/svelte-simple-router/commit/1a673c01133765415d10cb7b7dbdd9d456f84992))
* **RouteComponent:** delay properties update until component resolve ([bf75f01](https://github.com/dvcol/svelte-simple-router/commit/bf75f01270567b990261b74c44ebed25899ac05d))
* **RouteContainer:** code split and fix prop injection ([e96a818](https://github.com/dvcol/svelte-simple-router/commit/e96a818a9eac77c01ec0a1756f8b700961775270))
* **router:** decouple router from window ([3dac944](https://github.com/dvcol/svelte-simple-router/commit/3dac94418bb1665dc1d3cfae0c643769e8028fff))
* **router:** make back/forward/go await navigation before returning ([3dae60f](https://github.com/dvcol/svelte-simple-router/commit/3dae60fd7a0f9efe8b98f1cb61d790c051074e53))
* **router:** make listening state reactive ([0b5b098](https://github.com/dvcol/svelte-simple-router/commit/0b5b0984c97d7edbdc8fbf360a21810bf31736dc))
* **routing:** remove double router children rendering ([5ca97ab](https://github.com/dvcol/svelte-simple-router/commit/5ca97ab605b67349f3b93f992e061240d9bcd5cc))
* **transition:** adds container and only freeze during exit transition ([403d07c](https://github.com/dvcol/svelte-simple-router/commit/403d07c887d37ea15204ca440910ab025d47bf76))
* **transition:** freeze size while transitionning ([84f4f01](https://github.com/dvcol/svelte-simple-router/commit/84f4f01884a052df967eafa26103ff53092248a9))
* **transition:** remove key to prevent unnecessary renders ([0316a55](https://github.com/dvcol/svelte-simple-router/commit/0316a553054597b2a36a796aa81c1af0cad8d4a1))
* **utils:** adds trailing slash to pathname in hash mode ([9eee5ae](https://github.com/dvcol/svelte-simple-router/commit/9eee5ae6c8da46b2ed9ccbc5196234378d89b003))

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
