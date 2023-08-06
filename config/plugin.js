'use strict';

/** @type Egg.EggPlugin */
module.exports = {
  // had enabled by egg
  // static: {
  //   enable: true,
  // }
  ejs: {
    enable: true,
    package: 'egg-view-ejs',
  },

  jwt: {
    enable: true,
    package: 'egg-jwt',
  },

  mysql: {
    enable: true,
    package: 'egg-mysql',
  },

  cors: {
    enable: true,
    package: 'egg-cors',
  },
};
