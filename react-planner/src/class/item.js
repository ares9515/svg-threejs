import { Layer, Group } from "./export";
import { IDBroker, NameGenerator } from "../utils/export";
import { Map, fromJS } from "immutable";

import {
  MODE_IDLE,
  MODE_DRAWING_ITEM,
  MODE_DRAGGING_ITEM,
  MODE_ROTATING_ITEM,
  MODE_RESIZE_ITEM_RIGHT_BOTTOM,
  MODE_RESIZE_ITEM_RIGHT_TOP,
  MODE_RESIZE_ITEM_LEFT_TOP,
  MODE_RESIZE_ITEM_LEFT_BOTTOM,
} from "../constants";

class Item {
  static create(state, layerID, type, x, y, width, height, rotation) {
    let itemID = IDBroker.acquireID();

    let item = state.catalog.factoryElement(type, {
      id: itemID,
      name: NameGenerator.generateName(
        "items",
        state.catalog.getIn(["elements", type, "info", "title"])
      ),
      type,
      height,
      width,
      x,
      y,
      rotation,
    });

    state = state.setIn(["scene", "layers", layerID, "items", itemID], item);

    return { updatedState: state, item };
  }

  static select(state, layerID, itemID) {
    state = Layer.select(state, layerID).updatedState;
    state = Layer.selectElement(state, layerID, "items", itemID).updatedState;

    return { updatedState: state };
  }

  static remove(state, layerID, itemID) {
    state = this.unselect(state, layerID, itemID).updatedState;
    state = Layer.removeElement(state, layerID, "items", itemID).updatedState;

    state
      .getIn(["scene", "groups"])
      .forEach(
        (group) =>
        (state = Group.removeElement(
          state,
          group.id,
          layerID,
          "items",
          itemID
        ).updatedState)
      );

    return { updatedState: state };
  }

  static unselect(state, layerID, itemID) {
    state = Layer.unselect(state, layerID, "items", itemID).updatedState;

    return { updatedState: state };
  }

  static selectToolDrawingItem(state, sceneComponentType) {
    state = state.merge({
      mode: MODE_DRAWING_ITEM,
      drawingSupport: new Map({
        type: sceneComponentType,
      }),
    });

    return { updatedState: state };
  }

  static updateDrawingItem(state, layerID, x, y) {
    if (state.hasIn(["drawingSupport", "currentID"])) {
      state = state.updateIn(
        [
          "scene",
          "layers",
          layerID,
          "items",
          state.getIn(["drawingSupport", "currentID"]),
        ],
        (item) => item.merge({ x, y })
      );
    } else {
      let { updatedState: stateI, item } = this.create(
        state,
        layerID,
        state.getIn(["drawingSupport", "type"]),
        x,
        y,
        200,
        100,
        0
      );
      state = Item.select(stateI, layerID, item.id).updatedState;
      state = state.setIn(["drawingSupport", "currentID"], item.id);
    }

    return { updatedState: state };
  }

  static endDrawingItem(state, layerID, x, y) {
    let catalog = state.catalog;

    // let lines = state.getIn(['scene', 'layers', layerID, 'lines'])

    // let disable = false;
    // lines.map(line => {
    //   let { x: x1, y: y1 } = state.getIn(['scene', 'layers', layerID, 'vertices', line.get('vertices').get(0)]);
    //   let { x: x2, y: y2 } = state.getIn(['scene', 'layers', layerID, 'vertices', line.get('vertices').get(1)]);

    //   if (((x1 <= x - 75 && x2 >= x - 75)
    //     || (x1 <= x + 75 && x2 >= x + 75)
    //     || (x2 <= x - 75 && x1 >= x - 75)
    //     || (x2 <= x + 75 && x1 >= x + 75))
    //     && ((y1 <= y - 75 && y2 >= y - 75)
    //       || (y1 <= y + 75 && y2 >= y + 75)
    //       || (y2 <= y - 75 && y1 >= y - 75)
    //       || (y2 <= y + 75 && y1 >= y + 75))) {
    //     disable = true
    //   }
    // })

    // console.log('disable', disable)

    // if (disable) {
    //   return { updatedState: state };
    // }

    state = this.updateDrawingItem(state, layerID, x, y, catalog).updatedState;
    state = Layer.unselectAll(state, layerID).updatedState;
    state = state.merge({
      drawingSupport: Map({
        type: state.drawingSupport.get("type"),
      }),
    });

    return { updatedState: state };
  }

  static beginDraggingItem(state, layerID, itemID, x, y) {
    let item = state.getIn(["scene", "layers", layerID, "items", itemID]);

    state = state.merge({
      mode: MODE_DRAGGING_ITEM,
      draggingSupport: Map({
        layerID,
        itemID,
        startPointX: x,
        startPointY: y,
        originalX: item.x,
        originalY: item.y,
      }),
    });

    return { updatedState: state };
  }

  static updateDraggingItem(state, x, y) {
    let { draggingSupport, scene } = state;

    let layerID = draggingSupport.get("layerID");
    let itemID = draggingSupport.get("itemID");
    let startPointX = draggingSupport.get("startPointX");
    let startPointY = draggingSupport.get("startPointY");
    let originalX = draggingSupport.get("originalX");
    let originalY = draggingSupport.get("originalY");

    let diffX = startPointX - x;
    let diffY = startPointY - y;

    let item = scene.getIn(["layers", layerID, "items", itemID]);
    item = item.merge({
      x: originalX - diffX,
      y: originalY - diffY,
    });

    state = state.merge({
      scene: scene.mergeIn(["layers", layerID, "items", itemID], item),
    });

    return { updatedState: state };
  }

  static endDraggingItem(state, x, y) {
    state = this.updateDraggingItem(state, x, y).updatedState;
    state = state.merge({ mode: MODE_IDLE });

    return { updatedState: state };
  }

  static beginResizingItemRB(state, layerID, itemID, x, y) {
    state = state.merge({
      mode: MODE_RESIZE_ITEM_RIGHT_BOTTOM,
      resizeSupport: Map({
        layerID,
        itemID,
      }),
    });

    return { updatedState: state };
  }

  static updateResizingItemRB(state, x, y) {
    let { resizeSupport, scene } = state;

    let layerID = resizeSupport.get("layerID");
    let itemID = resizeSupport.get("itemID");
    let item = state.getIn(["scene", "layers", layerID, "items", itemID]);

    let deltaX = x - item.x;

    console.log("deltaX", deltaX);

    item = item.merge({
      zoom: deltaX,
    });

    state = state.merge({
      scene: scene.mergeIn(["layers", layerID, "items", itemID], item),
    });

    return { updatedState: state };
  }

  static endResizingItemRB(state, x, y) {
    state = this.updateResizingItemRB(state, x, y).updatedState;
    state = state.merge({ mode: MODE_IDLE });

    return { updatedState: state };
  }

  static beginResizingItemRT(state, layerID, itemID, x, y) {
    state = state.merge({
      mode: MODE_RESIZE_ITEM_RIGHT_TOP,
      resizeSupport: Map({
        layerID,
        itemID,
      }),
    });

    return { updatedState: state };
  }

  static updateResizingItemRT(state, x, y) {
    let { resizeSupport, scene } = state;

    let layerID = resizeSupport.get("layerID");
    let itemID = resizeSupport.get("itemID");
    let item = state.getIn(["scene", "layers", layerID, "items", itemID]);

    let deltaX = x - item.x;

    console.log("deltaX", deltaX);

    item = item.merge({
      zoom: deltaX,
    });

    state = state.merge({
      scene: scene.mergeIn(["layers", layerID, "items", itemID], item),
    });

    return { updatedState: state };
  }

  static endResizingItemRT(state, x, y) {
    state = this.updateResizingItemRT(state, x, y).updatedState;
    state = state.merge({ mode: MODE_IDLE });

    return { updatedState: state };
  }

  static beginResizingItemLT(state, layerID, itemID, x, y) {
    state = state.merge({
      mode: MODE_RESIZE_ITEM_LEFT_TOP,
      resizeSupport: Map({
        layerID,
        itemID,
      }),
    });

    return { updatedState: state };
  }

  static resizingItem(state, layerID, itemID, deltaX) {
    try {
      let { scene } = state;
      let item = state.getIn(["scene", "layers", layerID, "items", itemID]);

      item = item.merge({
        zoom: deltaX,
      });

      state = state.merge({
        scene: scene.mergeIn(["layers", layerID, "items", itemID], item),
      });
    } catch (e) {

    }
    return { updatedState: state };

  }

  static updateResizingItemLT(state, x, y) {
    let { resizeSupport, scene } = state;

    let layerID = resizeSupport.get("layerID");
    let itemID = resizeSupport.get("itemID");
    let item = state.getIn(["scene", "layers", layerID, "items", itemID]);

    let deltaX = x - item.x;

    console.log("deltaX", deltaX);

    item = item.merge({
      zoom: deltaX,
    });

    state = state.merge({
      scene: scene.mergeIn(["layers", layerID, "items", itemID], item),
    });

    return { updatedState: state };
  }

  static endResizingItemLT(state, x, y) {
    state = this.updateResizingItemRT(state, x, y).updatedState;
    state = state.merge({ mode: MODE_IDLE });

    return { updatedState: state };
  }

  static beginResizingItemLB(state, layerID, itemID, x, y) {
    state = state.merge({
      mode: MODE_RESIZE_ITEM_LEFT_BOTTOM,
      resizeSupport: Map({
        layerID,
        itemID,
      }),
    });

    return { updatedState: state };
  }

  static updateResizingItemLB(state, x, y) {
    let { resizeSupport, scene } = state;

    let layerID = resizeSupport.get("layerID");
    let itemID = resizeSupport.get("itemID");
    let item = state.getIn(["scene", "layers", layerID, "items", itemID]);

    let deltaX = x - item.x;

    console.log("deltaX", deltaX);

    item = item.merge({
      zoom: deltaX,
    });

    state = state.merge({
      scene: scene.mergeIn(["layers", layerID, "items", itemID], item),
    });

    return { updatedState: state };
  }

  static endResizingItemLB(state, x, y) {
    state = this.updateResizingItemRT(state, x, y).updatedState;
    state = state.merge({ mode: MODE_IDLE });

    return { updatedState: state };
  }

  static beginRotatingItem(state, layerID, itemID, x, y) {
    state = state.merge({
      mode: MODE_ROTATING_ITEM,
      rotatingSupport: Map({
        layerID,
        itemID,
      }),
    });

    return { updatedState: state };
  }

  static updateVerticalItem(state, layerID, itemID) {
    let { scene } = state;
    let item = state.getIn(["scene", "layers", layerID, "items", itemID]);
    item = item.merge({
      verticalFlip: !item.verticalFlip,
    });

    state = state.merge({
      scene: scene.mergeIn(["layers", layerID, "items", itemID], item),
    });

    return { updatedState: state };
  }


  static updateHorizontalItem(state, layerID, itemID) {
    let { scene } = state;
    let item = state.getIn(["scene", "layers", layerID, "items", itemID]);

    item = item.merge({
      horizontalFlip: !item.horizontalFlip,
    });

    state = state.merge({
      scene: scene.mergeIn(["layers", layerID, "items", itemID], item),
    });

    return { updatedState: state };
  }

  static updateRotatingItem(state, x, y) {
    let { rotatingSupport, scene } = state;

    let layerID = rotatingSupport.get("layerID");
    let itemID = rotatingSupport.get("itemID");
    let item = state.getIn(["scene", "layers", layerID, "items", itemID]);

    let deltaX = x - item.x;
    let deltaY = y - item.y;
    let rotation = (Math.atan2(deltaY, deltaX) * 180) / Math.PI - 90;

    if (-5 < rotation && rotation < 5) rotation = 0;
    if (-95 < rotation && rotation < -85) rotation = -90;
    if (-185 < rotation && rotation < -175) rotation = -180;
    if (85 < rotation && rotation < 90) rotation = 90;
    if (-270 < rotation && rotation < -265) rotation = 90;

    item = item.merge({
      rotation,
    });

    state = state.merge({
      scene: scene.mergeIn(["layers", layerID, "items", itemID], item),
    });

    return { updatedState: state };
  }

  static endRotatingItem(state, x, y) {
    state = this.updateRotatingItem(state, x, y).updatedState;
    state = state.merge({ mode: MODE_IDLE });

    return { updatedState: state };
  }

  static setProperties(state, layerID, itemID, properties) {
    state = state.mergeIn(
      ["scene", "layers", layerID, "items", itemID, "properties"],
      properties
    );

    return { updatedState: state };
  }

  static setJsProperties(state, layerID, itemID, properties) {
    return this.setProperties(state, layerID, itemID, fromJS(properties));
  }

  static updateProperties(state, layerID, itemID, properties) {
    properties.forEach((v, k) => {
      if (
        state.hasIn([
          "scene",
          "layers",
          layerID,
          "items",
          itemID,
          "properties",
          k,
        ])
      )
        state = state.mergeIn(
          ["scene", "layers", layerID, "items", itemID, "properties", k],
          v
        );
    });

    return { updatedState: state };
  }

  static updateJsProperties(state, layerID, itemID, properties) {
    return this.updateProperties(state, layerID, itemID, fromJS(properties));
  }

  static setAttributes(state, layerID, itemID, itemAttributes) {
    state = state.mergeIn(
      ["scene", "layers", layerID, "items", itemID],
      itemAttributes
    );
    return { updatedState: state };
  }

  static setJsAttributes(state, layerID, itemID, itemAttributes) {
    itemAttributes = fromJS(itemAttributes);
    return this.setAttributes(state, layerID, itemID, itemAttributes);
  }
}

export { Item as default };
