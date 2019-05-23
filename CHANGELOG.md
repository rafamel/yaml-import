# [2.0.0](https://github.com/rafamel/yaml-import/compare/v1.0.0...v2.0.0) (2019-05-23)


### Bug Fixes

* **get-schema/fetch:** !!payload/deep doesn't overwrite items with data when both files and data con ([bd9ac6a](https://github.com/rafamel/yaml-import/commit/bd9ac6a))


### BREAKING CHANGES

* **get-schema/fetch:** !!payload/deep previously overwrote all data with the contents of the payload data
field when it was an array, even if all files data were an array too. It now correctly concatenates.



# [1.0.0](https://github.com/rafamel/yaml-import/compare/v1.0.0-beta.0...v1.0.0) (2019-05-18)


### Bug Fixes

* **deps:** updates dependencies ([2953f62](https://github.com/rafamel/yaml-import/commit/2953f62))



# [1.0.0-beta.0](https://github.com/rafamel/yaml-import/compare/v0.3.1...v1.0.0-beta.0) (2019-05-12)


### Bug Fixes

* **deps:** updates dependencies ([c9f17a7](https://github.com/rafamel/yaml-import/commit/c9f17a7))
* **getSchema:** passes schemas to read ([63c5ddb](https://github.com/rafamel/yaml-import/commit/63c5ddb))
* **read:** assigns default for safe before running getSchema ([0ddd1a2](https://github.com/rafamel/yaml-import/commit/0ddd1a2))


### Features

* exports types from entry ([20183d8](https://github.com/rafamel/yaml-import/commit/20183d8))
* **bin:** adds example to bin help prompt ([e82d158](https://github.com/rafamel/yaml-import/commit/e82d158))
* **get-schema:** adds payload validation ([a7d9a03](https://github.com/rafamel/yaml-import/commit/a7d9a03))
* **get-schema:** implements new payload + merge-strategies based api ([817e53a](https://github.com/rafamel/yaml-import/commit/817e53a)), closes [#2](https://github.com/rafamel/yaml-import/issues/2)
* **get-schema:** sets recursive as optional ([1fca00f](https://github.com/rafamel/yaml-import/commit/1fca00f))
* **read, write:** take optional schemas array to extend ([a74e485](https://github.com/rafamel/yaml-import/commit/a74e485))
* handles absolute paths ([7daef30](https://github.com/rafamel/yaml-import/commit/7daef30))
* supports extending schemas for programmatic usage. ([#3](https://github.com/rafamel/yaml-import/issues/3)) ([9cf1f3c](https://github.com/rafamel/yaml-import/commit/9cf1f3c))


### BREAKING CHANGES

* **get-schema:** The api has been completely redesigned. With the exception of !!import/single,
you'll need to change all your imports in order to upgrade.
* **get-schema:** While directory merges were previously recursive by default, they are no longer so



## [0.3.1](https://github.com/rafamel/yaml-import/compare/v0.3.0...v0.3.1) (2019-01-11)



# [0.3.0](https://github.com/rafamel/yaml-import/compare/v0.2.3...v0.3.0) (2019-01-09)



## [0.2.3](https://github.com/rafamel/yaml-import/compare/v0.2.2...v0.2.3) (2018-01-06)



## [0.2.2](https://github.com/rafamel/yaml-import/compare/v0.2.1...v0.2.2) (2018-01-06)



## [0.2.1](https://github.com/rafamel/yaml-import/compare/v0.2.0...v0.2.1) (2017-10-20)



# [0.2.0](https://github.com/rafamel/yaml-import/compare/v0.1.1...v0.2.0) (2017-10-20)



## 0.1.1 (2017-10-19)



