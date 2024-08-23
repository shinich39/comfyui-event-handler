"use strict";

import { app } from "../../../scripts/app.js";
import { api } from "../../../scripts/api.js";
import * as util from "./util.min.js";

const MIN_SEED = 0;
const MAX_SEED = parseInt("0xffffffffffffffff", 16);
const STEPS_OF_SEED = 10;
const DEFAULT_MARGIN_X = 30;
const DEFAULT_MARGIN_Y = 60;

function _getNodes(type) {
  return app.graph._nodes.filter(e => e.comfyClass === "EventHandler" && 
    e.widgets?.find(e => e.name === "event")?.value === type);
}

function _execNodes(type, args) {
  const nodes = _getNodes(type);
  for (const node of nodes) {
    _execNode(node, args);
  }
}

function _execNode(node, args) {
  try {
    const SELF = node;
    const COMMAND = node.widgets?.find(e => e.name === "javascript")?.value;
    const STATE = node.statics;
    const PROPS = node.properties.__eventHandler__;
    const NODES = app.graph._nodes;
    const LINKS = app.graph.links;
    const SEED = getRandomSeed();
    const ARGS = args ?? [];

    const DATE = new Date();
    const YEAR = DATE.getFullYear();
    const MONTH = DATE.getMonth() + 1;
    const DAY = DATE.getDay();
    const HOURS = DATE.getHours();
    const MINUTES = DATE.getMinutes();
    const SECONDS = DATE.getSeconds();

    eval(COMMAND);
  } catch(err) {
    console.error(err);
  }
}

function _getDefaultCommand() {
  const nodes = app.graph._nodes
    .filter(e => e && e.comfyClass !== "EventHandler")
    .sort((a, b) => a.id - b.id);
  
  let text = "";
  for (const node of nodes) {
    const nodeId = node.id;
    const nodeTitle = node.title;
    text += `var n${nodeId} = find(${nodeId}); // ${nodeTitle}\n`;
  }
  text += `\n// You can use javascript code here!`;
  text += `\n// https://github.com/shinich39/comfyui-event-handler`;
  return text;
}

function _toNode(n) {
  if (typeof n === "number") {
    return find(n);
  } else if (typeof n === "string") {
    return find(n);
  } else if (typeof n === "object") {
    return n;
  }
}

function _isAutoQueueMode() {
  return document.querySelector("input[name='AutoQueueMode']:checked")?.value === "instant";
}

function _unsetAutoQueue() {
  if (_isAutoQueueMode()) {
    for (const elem of Array.prototype.slice.call(document.querySelectorAll("input[name='AutoQueueMode']"))) {
      if (elem.value === "") {
        elem.click();
        break;
      }
    }
  }
}

// methods

const match = function(node, query) {
  if (typeof query === "number") {
    return node.id === query;
  } else if (typeof query === "string") {
    return node.title === query || node.comfyClass === query || node.type === query;
  } else if (typeof query === "object") {
    return node.id === query.id;
  } else {
    return false;
  }
}

const find = function(query) {
  for (let i = 0; i < app.graph._nodes.length; i++) {
    const n = app.graph._nodes[i];
    if (match(n, query)) {
      return n;
    }
  }
}

const findLast = function(query) {
  for (let i = app.graph._nodes.length - 1; i >= 0; i--) {
    const n = app.graph._nodes[i];
    if (match(n, query)) {
      return n;
    }
  }
}

const getValues = function(node) {
  node = _toNode(node);
  let result = {};
  if (node.widgets) {
    for (const widget of node.widgets) {
      result[widget.name] = widget.value;
    }
  }
  return result;
}

const setValues = function(node, values) {
  node = _toNode(node);
  if (node.widgets) {
    for (const [key, value] of Object.entries(values)) {
      const widget = node.widgets.find(e => e.name === key);
      if (widget) {
        widget.value = value;
      }
    }
  }
}

const connect = function(a, b, outputName, inputName) {
  a = _toNode(a);
  b = _toNode(b);

  if (!inputName) {
    inputName = outputName;
  }

  outputName = outputName.toUpperCase();
  inputName = inputName.toLowerCase();

  let output = outputName ? a.outputs?.find(e => e.name.toUpperCase() === outputName) : null; // uppercase
  let outputSlot;
  let input = inputName ? b.inputs?.find(e => e.name.toLowerCase() === inputName) : null; // lowercase
  let inputSlot;

  if (output) {
    outputSlot = a.findOutputSlot(output.name);
    if (!input) {
      input = b.inputs?.find(e => e.type === output.type);
      if (input) {
        inputSlot = b.findInputSlot(input.name);
      }
    }
  }

  if (input) {
    inputSlot = b.findInputSlot(input.name);
    if (!output) {
      output = a.outputs?.find(e => e.type === input.type);
      if (output) {
        outputSlot = a.findOutputSlot(output.name);
      }
    }
  }

  if (typeof inputSlot === "number" && typeof outputSlot === "number") {
    a.connect(outputSlot, b.id, inputSlot);
  }
}

const random = util.random;

const getRandomSeed = function() {
  let max = Math.min(1125899906842624, MAX_SEED);
  let min = Math.max(-1125899906842624, MIN_SEED);
  let range = (max - min) / (STEPS_OF_SEED / 10);
  return Math.floor(Math.random() * range) * (STEPS_OF_SEED / 10) + min;
}

const enable = function(node) {
  node = _toNode(node);
  node.mode = 0;
}

const disable = function(node) {
  node = _toNode(node);
  node.mode = 4;
}

const toggle = function(node) {
  node = _toNode(node);
  node.mode = node.mode === 0 ? 4 : 0;
}

const remove = function(node) {
  node = _toNode(node);
  app.graph.remove(node);
}

const select = function(node) {
  node = _toNode(node);
  app.canvas.deselectAllNodes();
  app.canvas.selectNode(node);
}

const generate = function() {
  app.queuePrompt(0, app.ui.batchCount);
}

const stop = function() {
  _unsetAutoQueue();
}

const cancel = function() {
  api.interrupt();
}

const putOnLeft = function(targetNode, anchorNode) {
  targetNode = _toNode(targetNode);
  anchorNode = _toNode(anchorNode);
  targetNode.pos[0] = anchorNode.pos[0] - targetNode.size[0] - DEFAULT_MARGIN_X;
  targetNode.pos[1] = anchorNode.pos[1];
}

const putOnRight = function(targetNode, anchorNode) {
  targetNode = _toNode(targetNode);
  anchorNode = _toNode(anchorNode);
  targetNode.pos[0] = anchorNode.pos[0] + anchorNode.size[0] + DEFAULT_MARGIN_X;
  targetNode.pos[1] = anchorNode.pos[1];
}

const putOnTop = function(targetNode, anchorNode) {
  targetNode = _toNode(targetNode);
  anchorNode = _toNode(anchorNode);
  targetNode.pos[0] = anchorNode.pos[0];
  targetNode.pos[1] = anchorNode.pos[1] - targetNode.size[1] - DEFAULT_MARGIN_Y;
}

const putOnBottom = function(targetNode, anchorNode) {
  targetNode = _toNode(targetNode);
  anchorNode = _toNode(anchorNode);
  targetNode.pos[0] = anchorNode.pos[0];
  targetNode.pos[1] = anchorNode.pos[1] + anchorNode.size[1] + DEFAULT_MARGIN_Y;
}

const moveToRight = function(targetNode) {
  targetNode = _toNode(targetNode);
  let isChanged = true;
  while(isChanged) {
    isChanged = false;
    for (const node of app.graph._nodes) {
      if (node.id === targetNode.id) {
        continue;
      }
      const top = node.pos[1];
      const bottom = node.pos[1] + node.size[1];
      const left = node.pos[0];
      const right = node.pos[0] + node.size[0];
      const isCollisionX = left <= node.pos[0] + targetNode.size[0] && 
        right >= targetNode.pos[0];
      const isCollisionY = top <= node.pos[1] + targetNode.size[1] && 
        bottom >= targetNode.pos[1];

      if (isCollisionX && isCollisionY) {
        targetNode.pos[0] = right + DEFAULT_MARGIN_X;
        isChanged = true;
      }
    }
  }
}

const moveToBottom = function(targetNode) {
  targetNode = _toNode(targetNode);
  let isChanged = true;
  while(isChanged) {
    isChanged = false;
    for (const node of app.graph._nodes) {
      if (node.id === targetNode.id) {
        continue;
      }
      const top = node.pos[1];
      const bottom = node.pos[1] + node.size[1];
      const left = node.pos[0];
      const right = node.pos[0] + node.size[0];
      const isCollisionX = left <= targetNode.pos[0] + targetNode.size[0] && 
        right >= targetNode.pos[0];
      const isCollisionY = top <= targetNode.pos[1] + targetNode.size[1] && 
        bottom >= targetNode.pos[1];

      if (isCollisionX && isCollisionY) {
        targetNode.pos[1] = bottom + DEFAULT_MARGIN_Y;
        isChanged = true;
      }
    }
  }
}

const moveX = function(node, n) {
  node.pos[0] += n;
}

const moveY = function(node, n) {
  node.pos[1] += n;
}

api.addEventListener("promptQueued", function(...args) {
  _execNodes("after_queued", args);
});

api.addEventListener("status", function(...args) {
  _execNodes("status", args);
});

api.addEventListener("progress", function(...args) {
  _execNodes("progress", args);
});

api.addEventListener("executing", function(...args) {
  _execNodes("executing", args);
});

api.addEventListener("executed", function(...args) {
  _execNodes("executed", args);
});

api.addEventListener("execution_start", function(...args) {
  _execNodes("execution_start", args);
});

api.addEventListener("execution_success", function(...args) {
  _execNodes("execution_success", args);
});

api.addEventListener("execution_error", function(...args) {
  _execNodes("execution_error", args);
});

api.addEventListener("execution_cached", function(...args) {
  _execNodes("execution_cached", args);
});

app.registerExtension({
	name: "shinich39.EventHandler",
  setup() {
    const origQueuePrompt = app.queuePrompt;
    app.queuePrompt = async function(...args) {
      _execNodes("before_queued", args);
      const r = await origQueuePrompt.apply(this, arguments);
      return r;
    }
  },
  nodeCreated(node) {
    if (node.comfyClass === "EventHandler") {
      node.statics = {};
      if (!node.properties) {
        node.properties = {};
      }
      node.properties.__eventHandler__ = {};

      const w = node.widgets?.find(e => e.name === "javascript");
      if (w) {
        w.value = _getDefaultCommand();
      }

      const b = node.addWidget("button", "Execute", null, () => {}, {
        serialize: false,
      });

      b.computeSize = () => [0, 26];
      b.callback = () => _execNode(node, []);
    }
	},
});