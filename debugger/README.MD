## Visual Debugger UI

This folder contains the source code for the UI used in the [visual debugger IntelliJ plugin](https://plugins.jetbrains.com/plugin/16851-visual-debugger).

You can find the source code for the plugin [here](https://github.com/timKraeuter/VisualDebugger).

## Development

### Installing dependencies
```console
npm i
cd starter
npm i
```

### Running the UI
```console
cd starter
npm run dev
```

### Deploy changes to the plugin
Make sure the plugin repository is cloned in the same directory as this repository.
```console
cd starter
npm run build:plugin
```