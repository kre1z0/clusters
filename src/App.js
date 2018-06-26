import "@babel/polyfill";
import mustache from "mustache";
import Map from "./containers/Map";
import { mapContainer } from "./templates/map-template";

/**
 * start app function
 * @param {dom-node} domNode
 */
export function startApp(domNode) {
  if (!domNode) {
    throw Error("start app need dom node");
  }
  domNode.innerHTML = mustache.render(mapContainer);
  new Map();
}
