# boutique-js

Minimalistic MVC framework. Made as a fun experiment and out of dislike for feature bloat in popular libraries.

## Features

- Create DOM elements or HTML
- Reactive application state
- Side effects

## Create DOM elements

```ts
function App() {
  return div({ id: "my-app" }, [
    p({ $text: "hello world" })
  ]);
}

// get HTML string (for example; when server side rendering)
App().html
```

## Application state & reactivity

```ts
const date = state(new Date());

setInterval(() => date.state = new Date(), 1000);

function App() {
  return div({ id: "my-app" }, [
    p({ $text: () => date.state.toLocaleTimeString() })
  ]);
}
```

## Side effects

```ts
function App() {
  const date = state(new Date());

  // runs when element appended to dom
  effect([], () => {
    setInterval(() => date.state = new Date(), 1000);
  });
  
  // runs every time 'date' changes
  effect([date], () => {
    console.log("date changed");
  });
  
  return div({ id: "my-app" }, [
    p({ $text: () => date.state.toLocaleTimeString() })
  ]);
}
```

## Operators




