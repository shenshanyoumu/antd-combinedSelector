import 'isomorphic-fetch';

// when unhandledRejection happens, do nothing
process.on('unhandledRejection', () => {});

global.requestAnimationFrame = function(callback) {
  setTimeout(callback, 0);
};

global.cancelAnimationFrame = function(cb) {
  return clearTimeout(cb, 0);
};
