var {console, callUnsafeJSObject, isWindowClosed} = require("utils");
var listeners = {};

function addEventListener(wrappedContentWindow, event, callback) {
  function unloadListener() {
    console.log("[Firefox:eventsManager] Unloading listener with event " + event + "...");
    removeEventListener(wrappedContentWindow, event, callback);
    
    wrappedContentWindow = null;
    event = null;
    callback = null;
    unloadListener = null;
  }
  
  if (!listeners || !listeners[event]) listeners[event] = [];
  listeners[event].push({ wrappedContentWindow: wrappedContentWindow, callback: callback, unload: unloadListener });
  
  wrappedContentWindow.addEventListener("unload", unloadListener, true);
}

function removeEventListener(wrappedContentWindow, event, callback) {
  if (!listeners || !listeners[event]) return;
  
  for (let i = 0; i < listeners[event].length; i++) {
    if (listeners[event][i].wrappedContentWindow == wrappedContentWindow && listeners[event][i].callback == callback) {
      listeners[event][i].wrappedContentWindow.removeEventListener("unload", listeners[event][i].unload, true);
      listeners[event][i].wrappedContentWindow = null;
      listeners[event][i].callback = null;
      listeners[event][i] = null;
      
      listeners[event].splice(i, 1);
      break;
    }
  }
}

function fireEvent(event, key, value) {
  if (listeners && listeners[event] && listeners[event].length > 0) {
    let rv = {
      __exposedProps__: {
        key: "r",
        value: "r"
      },
      key: key,
      value: value
    };
    
    for (let i = 0; i < listeners[event].length; i++) {
      if (isWindowClosed(listeners[event][i].wrappedContentWindow)) {
        
        listeners[event].splice(i, 1); i--;
      } else {
        try {
          callUnsafeJSObject(listeners[event][i].wrappedContentWindow, listeners[event][i].callback, rv);
        } catch (e) {
          console.error(e);
        }
      }
    }
  }
}

unload(function(){
  if (listeners) {
    for (let key in listeners) {
      if (listeners.hasOwnProperty(key)) {
        for (let i = 0; i < listeners[key].length; i++) {
          listeners[event][i].wrappedContentWindow.removeEventListener("unload", listeners[event][i].unload, true);
          delete listeners[key][i].wrappedContentWindow;
          delete listeners[key][i].callback;
          delete listeners[key][i];
        }
        delete listeners[key];
      }
    }
    delete listeners;
  }
});

exports["addEventListener"] = addEventListener;
exports["removeEventListener"] = removeEventListener;
exports["fireEvent"] = fireEvent;