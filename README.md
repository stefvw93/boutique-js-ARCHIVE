# boutique-js

Boutique is a small, minimalistic library to create user interfaces with.

Boutique focusses on

- vanilla js, no pre-processors or compilers required
- small amount of features means you're flexible
- small library means small build size (approx. 3kb)

## Features

- Create DOM elements or HTML
- Reactive application state
- Run side effects

## Create DOM elements

You can build your user interface using the built-in html element functions, like `div()`. These functions receive attributes and children, and return a virtual DOM node which you can mount.

```ts
function App() {
  return div({ id: "my-app" }, [p({ $text: "hello world" })]);
}

const app = App();

// mount your app
app().mount(document.body);

// or get HTML as string (for example; when server side rendering)
app().html;
```

## Application state & reactivity

```ts
const date = state(new Date());

setInterval(() => (date.state = new Date()), 1000);

function App() {
  return div({ id: "my-app" }, [
    p({ $text: () => date.state.toLocaleTimeString() }),
  ]);
}
```

## Side effects

```ts
function App() {
  const date = state(new Date());

  // runs when element appended to dom
  effect([], () => {
    setInterval(() => (date.state = new Date()), 1000);
  });

  // runs every time 'date' changes
  effect([date], () => {
    console.log("date changed");
  });

  // runs on any update
  effect(() => {
    console.log("update");
  });

  return div({ id: "my-app" }, [
    p({ $text: () => date.state.toLocaleTimeString() }),
  ]);
}
```

As you can maybe make out from the examples so far, your entire app tree, made out of multiple functions, will only have to run _once_ to create your entire DOM tree and state bindings. This means, among other things, that anything you define in function scope will be maintained.

```js
function MyComponent() {
  let mouseX;
  let mouseY;
  let myElement;

  effect([], () => {
    myElement = document.getElementById("my-component");

    document.body.addEventListener("mousemove", (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
    });
  });

  return div({ id: "my-component" });
}
```

## Attributes & children

The main concept for creating a reactive user interface with Boutique, is using dynamic or static attributes, or children. The difference in dynamic and static is in the way you define your attributes or children. For dynamic values, you should use a function that returns a value, while for static values you can simply pass a value.

Dynamic values are subject to change, and may trigger DOM updates. Static attributes will never change and will never cause DOM updates.

Let's see this in practice. This is an example of a static attribute. Which will never change, and will never trigger DOM updates.

```ts
// `id` is a static attribute
div({
  id: "my-id",
});
```

Let's make `id` a dynamic attribute. We have to change it to a function that returns a value, like so:

```ts
// `id` is a dynamic attribute
div({
  id: () => myState.state,
});
```

`id` is now a dynamic attribute, meaning it is subject to change and may cause DOM updates.

These same concepts apply to child nodes:

```ts
// this child array is static
div({}, [div(), div(), div()]);

// this child array is dynamic
div({}, () => [div(), div(), ...myState.state.map(...)]);
```

## State

Before any dynamic attribute or child will update it's value, and trigger a DOM update, some related state has to change. Creating a stateful value is done using the `state()` function.

```ts
const number = state(0);
```

Reading and updating the value of `number` is done through it's `state` property.

```ts
const number = state(0);
number.state = 1;
console.log(number.state); // 1
```

You can also use the `set` method to update a state value, using it's current value.

```ts
const number = state(0);
number.set((state) => state + 1);
console.log(number.state); // 1
```

When you use a state value in a dynamic attribute or child array, their respective value changes will cause DOM updates.

```ts
const number = state(0);

// reassigning number.state will update the div element
div({ id: () => number.state });
```

## Operators

You can use some special attributes to control the DOM element and it's textual content.
Those attributes are `$if`, `$text` and `$html`.

**$if**

`$if` defines wether the corresponding DOM element should be mounted or not. This must always be a dynamic attribute.

```ts
div({ $if: () => someBoolean });
```

**$text**

`$text` defines the corresponding DOM element's inner text value.

```ts
div({ $text: "Hello, world!" });
// or
div({ $text: () => someStateValue });
```

**$html**

`$html` defines the corresponding DOM element's inner HTML. Like `$text`, you use a string value, but HTML syntax is rendered.

```ts
div({ $html: "<p>Hello, world!</p>" });
// or
div({ $html: () => someStateValue });
```
