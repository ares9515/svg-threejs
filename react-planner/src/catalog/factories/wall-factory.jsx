import React from "react";
import { buildWall, updatedWall } from "./wall-factory-3d";
import * as SharedStyle from "../../shared-style";
import * as Geometry from "../../utils/geometry";
import Translator from "../../translator/translator";

const epsilon = 20;
const STYLE_TEXT = { textAnchor: "middle" };
const STYLE_LINE = { stroke: SharedStyle.LINE_MESH_COLOR.selected };
const STYLE_RECT = {
  strokeWidth: 1,
  stroke: SharedStyle.LINE_MESH_COLOR.unselected,
  fill: "#8B8B8B",
};
const STYLE_RECT_SELECTED = {
  fill: "#407AEC",
  strokeWidth: 1,
  stroke: SharedStyle.LINE_MESH_COLOR.selected,
};

let translator = new Translator();

export default function WallFactory(name, info, textures) {
  let wallElement = {
    name,
    prototype: "lines",
    info,
    properties: {
      height: {
        label: translator.t("height"),
        type: "length-measure",
        defaultValue: {
          length: 300,
        },
      },
      thickness: {
        label: translator.t("thickness"),
        type: "length-measure",
        defaultValue: {
          length: info.thickness,
        },
      },
    },

    render2D: function (element, layer, scene) {
      const lineType = element.getIn(["name"]);

      if (lineType == "Dividerwall") {
        let { x: x1, y: y1 } = layer.vertices.get(element.vertices.get(0));
        let { x: x2, y: y2 } = layer.vertices.get(element.vertices.get(1));

        let length = Geometry.pointsDistance(x1, y1, x2, y2);

        return element.selected ? (
          <g>
            <line
              x1="0"
              y1="0"
              x2={length}
              y2="0"
              style={STYLE_RECT_SELECTED}
              stroke="black"
              strokeDasharray="4"
            />
          </g>
        ) : (
          <g>
            <line
              x1="0"
              y1="0"
              x2={length}
              y2="0"
              style={STYLE_RECT}
              stroke="black"
              strokeDasharray="4"
            />
          </g>
        );
      } else {
        let { x: x1, y: y1 } = layer.vertices.get(element.vertices.get(0));
        let { x: x2, y: y2 } = layer.vertices.get(element.vertices.get(1));

        let length = Geometry.pointsDistance(x1, y1, x2, y2);

        let thickness = element.getIn(["properties", "thickness", "length"]);
        let half_thickness = thickness / 2;

        return element.selected ? (
          <g>
            <rect
              x="0"
              y={-half_thickness}
              width={length}
              height={thickness}
              style={STYLE_RECT_SELECTED}
            />
          </g>
        ) : (
          <rect
            x="0"
            y={-half_thickness}
            width={length}
            height={thickness}
            style={STYLE_RECT}
          />
        );
      }
    },

    render3D: function (element, layer, scene) {
      return buildWall(element, layer, scene, textures);
    },

    updateRender3D: (
      element,
      layer,
      scene,
      mesh,
      oldElement,
      differences,
      selfDestroy,
      selfBuild
    ) => {
      return updatedWall(
        element,
        layer,
        scene,
        textures,
        mesh,
        oldElement,
        differences,
        selfDestroy,
        selfBuild
      );
    },
  };

  if (textures && textures !== {}) {
    let textureValues = { none: "None" };

    for (let textureName in textures) {
      textureValues[textureName] = textures[textureName].name;
    }

    wallElement.properties.textureA = {
      label: translator.t("texture") + " A",
      type: "enum",
      defaultValue: textureValues.bricks ? "bricks" : "none",
      values: textureValues,
    };

    wallElement.properties.textureB = {
      label: translator.t("texture") + " B",
      type: "enum",
      defaultValue: textureValues.bricks ? "bricks" : "none",
      values: textureValues,
    };
  }

  return wallElement;
}
