// DOM utility functions with event delegation pattern

// Create element with properties
export function createElement(tag, props = {}, children = []) {
  const el = document.createElement(tag);
  
  // Set properties
  Object.entries(props).forEach(([key, value]) => {
    if (key === 'className') {
      el.className = value;
    } else if (key === 'dataset') {
      Object.entries(value).forEach(([dataKey, dataValue]) => {
        el.dataset[dataKey] = dataValue;
      });
    } else if (key.startsWith('on') && typeof value === 'function') {
      // Event listener
      const eventName = key.slice(2).toLowerCase();
      el.addEventListener(eventName, value);
    } else {
      el[key] = value;
    }
  });
  
  // Append children
  children.forEach(child => {
    if (typeof child === 'string') {
      el.appendChild(document.createTextNode(child));
    } else if (child instanceof Node) {
      el.appendChild(child);
    }
  });
  
  return el;
}

// Event delegation: attach one listener to parent, handle events for children
export function delegate(parent, eventType, selector, handler) {
  parent.addEventListener(eventType, (event) => {
    const target = event.target.closest(selector);
    if (target && parent.contains(target)) {
      handler.call(target, event, target);
    }
  });
}

// Query selector shortcuts
export function $(selector, context = document) {
  return context.querySelector(selector);
}

export function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// Mount component to container
export function mount(container, element) {
  if (typeof container === 'string') {
    container = $(container);
  }
  
  if (!container) {
    throw new Error('Container not found');
  }
  
  container.innerHTML = '';
  
  if (typeof element === 'string') {
    container.innerHTML = element;
  } else if (element instanceof Node) {
    container.appendChild(element);
  }
  
  return container;
}

