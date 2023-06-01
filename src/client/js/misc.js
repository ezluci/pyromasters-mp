'use strict'

function waitForElm(selector) {
   return new Promise((resolve) => {
      if (document.querySelector(selector))
         return resolve(document.querySelector(selector));

      const observer = new MutationObserver((mutations) => {
         if (document.querySelector(selector)) {
            resolve(document.querySelector(selector));
            observer.disconnect();
         }
      });

      observer.observe(document, {
         childList: true,
         subtree: true
      });
   });
}

function invertHex(hex) {
   return (Number(`0x1${hex}`) ^ 0xFFFFFF).toString(16).substring(1).toUpperCase()
}