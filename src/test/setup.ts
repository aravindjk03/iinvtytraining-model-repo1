import '@testing-library/jest-dom';

// ResizeObserver mock for JSDOM
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// scrollTo mock
window.scrollTo = () => {};
