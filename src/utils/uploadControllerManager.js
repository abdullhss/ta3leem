const controllers = {};

export const setController = (uid, controller) => {
  controllers[uid] = controller;
};

export const getController = (uid) => controllers[uid];

export const removeController = (uid) => {
  delete controllers[uid];
};

export const abortController = (uid) => {
  if (controllers[uid]) {
    controllers[uid].abort();
    removeController(uid);
  }
};
