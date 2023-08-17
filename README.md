[![Build & Test](https://github.com/timKraeuter/object-diagram-modeler/actions/workflows/ci.yml/badge.svg)](https://github.com/timKraeuter/object-diagram-modeler/actions/workflows/ci.yml)

## Try the object diagram modeler [here](https://timkraeuter.com/object-diagram-modeler/).

## Object diagram modeler

This folder contains the source code for an [object diagram modeler](https://timkraeuter.com/object-diagram-modeler/) library based on **diagram-js**.

### Installing dependencies

```console
npm i
cd starter
npm i
```

### Running the modeler

```console
cd starter
npm start
```

### Build & deploy changes to github-pages

```console
cd starter
npm run build:github-pages
```

## Object diagram debugger

The UI used in the [visual debugger IntelliJ plugin](https://plugins.jetbrains.com/plugin/16851-visual-debugger) is configured in the folder `starter/debugger`.
This serves as an example how the library can be used and customized (here we added a **Websocket connection** to read debug data live).

### Installing dependencies

```console
npm i
cd starter
npm i
```

### Running the debugger

```console
cd starter
npm run startDebugger
```

### Building the debugger

```console
cd starter
npm run buildDebugger:deploy
```

The debugger will be build at the right location for the **visual debugger plugin**.

## License

MIT

Contains parts of ([bpmn-io](https://github.com/bpmn-io)) released under the [bpmn.io license](http://bpmn.io/license).

## Acknowledgments

I used the excellent [postit-js](https://github.com/pinussilvestrus/postit-js) example as a starting point for my project.
