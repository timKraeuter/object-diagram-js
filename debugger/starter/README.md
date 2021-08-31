# Object diagram modeler

This example uses [diagram-js](https://github.com/bpmn-io/diagram-js) to implement a modeler for object diagrams.

## About

This example is a node-style web application that builds a user interface around the diagram-js framework.


## Building

You need a [NodeJS](http://nodejs.org) development stack with [npm](https://npmjs.org) installed to build the project.

To install all project dependencies execute

```
npm install
```

Build the application via

```
npm run all
```

You may also spawn a development setup by executing

```
npm run dev
```

Both tasks generate the distribution ready client-side modeler application into the `public` folder.

Serve the application locally or via a web server (nginx, apache, embedded).