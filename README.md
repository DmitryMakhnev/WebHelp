# WebHelp

It's a tests task for implementation of Table of Contents component for WebHelp

## Main Design Concept Of Code Base
It's [React](https://reactjs.org/) based application web application
with [MobX](https://mobx.js.org/) for state management
with reactivity and models of data separated by domain zone
which are presets by [view models](https://en.wikipedia.org/wiki/View_model#Viewpoint_model)
for better testing all levels of application


## Outside Control Of App
You can filter by text and select some available pages by page id
from global namespace by `JB_WEB_HELP_API` methods

You can specify the name of this method in [`webpack.config.js`](./webpack.config.js)
by [`DefinePlugin`](https://webpack.js.org/plugins/define-plugin/) of webpack. 

### Filtration By Text
#### Method
`JB_WEB_HELP_API.filterByText(text: string)`

#### Example
run in browser console 
```javascript
JB_WEB_HELP_API.filterByText('idea')
``` 

### Page Selection
#### Method
`JB_WEB_HELP_API.selectByPageId(pageId: string): boolean`

Method will return `true` if page was selected
or `false` if you trying select not exist page

#### Example
Run in browser console
```javascript
JB_WEB_HELP_API.selectByPageId('procedures.vcWithIDEA.usingSVNIntegration.share');
```

## Work With Project

### Install Dependencies
```shell script
npm i
```

### Start
```shell script
npm run start
```

### Run Tests
```shell script
npm run test
```

### Run Linter
```shell script
npm run lint
```

### Run Prettier
```shell script
npm run prettier
```

### Build Project
```shell script
npm run build
``` 

### Stack
This project use 

#### In Runtime
* [React](https://reactjs.org/) for rendering in browser
* [react-intl](https://github.com/formatjs/react-intl#readme) for i18n
* [MobX](https://mobx.js.org/README.html) for state management
* [mobx-react](https://github.com/mobxjs/mobx-react#readme) for binding state management to React
* [@xstate/fsm](https://xstate.js.org/docs/packages/xstate-fsm/) for some FSM's into states

#### Dev Tooling
* [jest](https://jestjs.io/) for tests
* [webpack](https://webpack.js.org/) and some common tools around it
* [eslint](https://eslint.org/) for linting
* [prettier](https://prettier.io/) for code formatting
* [lintstaged](https://github.com/okonet/lint-staged#readme)
(⚠️ it's not completed setting, because it has problems with reading correct eslint config
and I don't have time for resolving this issue)
for running eslint and prettier for staged files on git pre commit hook    
* [serve-handler](https://github.com/zeit/serve-handler#readme) for serving some data for dev stubbing


### Structure

#### Files Structure
* [`./src/`](./src) code of project
    * [`./src/app`](./src/app) current project code
        * [`./src/app/main.tsx`](./src/app/main.tsx) entry file of project
        * [`./src/app/components`](./src/app/components) dumb react components of project
        * [`./src/app/contexts`](./src/app/contexts) contexts of project. In general we use it for connection mockable data layer and components
        * [`./src/app/data-layer`](./src/app/data-layer) code for working with data and client side business logic
        * [`./src/app/higher-order-components`](./src/app/higher-order-components)
        React [HOC's](https://reactjs.org/docs/higher-order-components.html) for connection data layer with components.
        Also some HOC's can contains them [view models](https://en.wikipedia.org/wiki/View_model#Viewpoint_model) 
        * [`./src/app/styles`](./src/app/styles) common styles, vars and mixins (we use scss) for project  
    * [`./src/images`](./src/images) static images of project
    * [`./src/lib`](./src/lib) reusable code which should be in separate libraries   
* [`./lang`](./lang) localization files of project
* [`./stub-server`](./stub-server) stub server for mocking backend

#### Tests
##### Unit Tests
You can find unit tests near with files which was test tests

##### Other Tests
At this time project use only unit tests. We should write not only unit tests


### Not Simple solutions of this project

#### Chunked List

For good performance of big list for Table of Contents we use list
which can display big count of items. [Read more](./src/app/components/chunked-list/README.md)   

#### Table Of Contents Tree View Model

For transforming Table Of Contents tree and manipulations with them items for [chunked list](./src/app/components/chunked-list/README.md)
we use view model. [Read more](./src/app/higher-order-components/table-of-contents-panel/view-model/tree/README.md)
 
