import * as Three from 'three';
import React from 'react';

const ZOOM = 5;
const WIDTH = 27.5 * ZOOM;
const DEPTH = 19.71 * ZOOM;
const PARAM1 = 6.66 * ZOOM;
const PARAM2 = 2.1 * ZOOM;
const STROKE_WIDTH = 3;
const INNER_HEIGHT = 11.82 * ZOOM;
const INNER_WIDTH = 19.5 * ZOOM;
const HEIGHT=150;

const STYLE_TRANPARENT = {
  strokeWidth: 1,
  stroke: "transparent",
  fill: "transparent",
};

const STYLE_RECT = {
  strokeWidth: 1,
  stroke: "#8E9BA2",
  fill: "#8B8B8B",
};
const STYLE_RECT_SELECTED = {
  fill: "#407AEC",
  strokeWidth: 1,
  stroke: "#407AEC",
};
const STYLE_PNG_BASE = {
  transform: 'translate(-11px, 37.95px)'
};

const STYLE = {
  stroke: "#4F8BFF",
  strokeWidth: "1px",
};

const STYLE_TEXT = {
  fontFamily: "DM Sans",
  fontStyle: "normal",
  fontWeight: 400,
  fontSize: "11px",
  lineHeight: "12px",
  textAlign: "right",
  fill: "#F6F6F6",
  flex: "none",
  order: 0,
  flexGrow: 0,

  //http://stackoverflow.com/questions/826782/how-to-disable-text-selection-highlighting-using-css
  WebkitTouchCallout: "none" /* iOS Safari */,
  WebkitUserSelect: "none" /* Chrome/Safari/Opera */,
  MozUserSelect: "none" /* Firefox */,
  MsUserSelect: "none" /* Internet Explorer/Edge */,
  userSelect: "none",
};

export default {
  name: 'rectangle-table',
  prototype: 'items',

  info: {
    tag: ['rectangle-table', 'rectangle-table'],
    title: 'rectangle-table',
    description: 'rectangle-table',
    image: null
  },
  properties: {
    altitude: {
      label: 'quota',
      type: 'length-measure',
      defaultValue: {
        length: 220,
        unit: 'cm'
      }
    }
  },

  render2D: function (element, layer, scene) {
    const half_thickness = 1.2;
    const length = WIDTH;
    const lines = []
    layer.lines.map(line => {
      const vertices = layer.vertices;
      const {x: x1, y: y1} =  vertices.get(line.vertices.get(0))
      const {x: x2, y: y2} =  vertices.get(line.vertices.get(1))

      lines.push({x1, y1, x2, y2})
    })

    const x = element.x;
    const y = element.y;

    let poly01 = `${-WIDTH / 2 - half_thickness},${DEPTH + half_thickness}`, poly02 = `${WIDTH / 2 + half_thickness},${DEPTH + half_thickness}`, poly03 = `${WIDTH / 2 + half_thickness},${0}`, poly04 = `${-WIDTH / 2 - half_thickness},${0}`;
    let poly11 = `${-INNER_WIDTH / 2},${half_thickness + (DEPTH - INNER_HEIGHT) / 2}`, poly12 = `${INNER_WIDTH / 2},${half_thickness + (DEPTH - INNER_HEIGHT) / 2}`, poly13 = `${INNER_WIDTH / 2},${-half_thickness + (DEPTH - INNER_HEIGHT) / 2}`, poly14 = `${-INNER_WIDTH / 2},${-half_thickness + (DEPTH - INNER_HEIGHT) / 2}`;
    let poly21 = `${-INNER_WIDTH / 2 - half_thickness},${INNER_HEIGHT + (DEPTH - INNER_HEIGHT) / 2}`, poly22 = `${-INNER_WIDTH / 2 + half_thickness},${INNER_HEIGHT + (DEPTH - INNER_HEIGHT) / 2}`, poly23 = `${-INNER_WIDTH / 2 + half_thickness},${(DEPTH - INNER_HEIGHT) / 2}`, poly24 = `${-INNER_WIDTH / 2 - half_thickness},${(DEPTH - INNER_HEIGHT) / 2}`;
    let poly31 = `${INNER_WIDTH / 2 - half_thickness},${INNER_HEIGHT + (DEPTH - INNER_HEIGHT) / 2}`, poly32 = `${INNER_WIDTH / 2 + half_thickness},${INNER_HEIGHT + (DEPTH - INNER_HEIGHT) / 2}`, poly33 = `${INNER_WIDTH / 2 + half_thickness},${(DEPTH - INNER_HEIGHT) / 2}`, poly34 = `${INNER_WIDTH / 2 - half_thickness},${(DEPTH - INNER_HEIGHT) / 2}`;
    let poly41 = `${-INNER_WIDTH / 2},${INNER_HEIGHT + half_thickness + (DEPTH - INNER_HEIGHT) / 2}`, poly42 = `${INNER_WIDTH / 2},${INNER_HEIGHT + half_thickness + (DEPTH - INNER_HEIGHT) / 2}`, poly43 = `${INNER_WIDTH / 2},${INNER_HEIGHT - half_thickness + (DEPTH - INNER_HEIGHT) / 2}`, poly44 = `${-INNER_WIDTH / 2},${INNER_HEIGHT - half_thickness + (DEPTH - INNER_HEIGHT) / 2}`;

    return element.selected ? (
      <g transform={`translate(${0},${-DEPTH / 2})`} width={WIDTH} height={DEPTH} lines={lines} x={x} y={y}>
        <defs>
          <filter id="rounded-corners" x="-25%" width="150%" y="-25%" height="150%">
            <feFlood floodColor="#407AEC" />
            <feGaussianBlur stdDeviation="2" />
            <feComponentTransfer>
              <feFuncA type="table" tableValues="0 0 0 1" />
            </feComponentTransfer>

            <feComponentTransfer>
              <feFuncA type="table" tableValues="0 1 1 1 1 1 1 1" />
            </feComponentTransfer>
            <feComposite operator="over" in="SourceGraphic" />
          </filter>
        </defs>
        <polygon points={`${poly01 + " " + poly02 + " " + poly03 + " " + poly04}`} style={STYLE_TRANPARENT} />
        <polygon points={`${poly11 + " " + poly12 + " " + poly13 + " " + poly14}`} style={STYLE_RECT_SELECTED} />
        <polygon points={`${poly21 + " " + poly22 + " " + poly23 + " " + poly24}`} style={STYLE_RECT_SELECTED} />
        <polygon points={`${poly31 + " " + poly32 + " " + poly33 + " " + poly34}`} style={STYLE_RECT_SELECTED} />
        <polygon points={`${poly41 + " " + poly42 + " " + poly43 + " " + poly44}`} style={STYLE_RECT_SELECTED} />
        <svg width={PARAM1 + 2 * STROKE_WIDTH} height={PARAM2 + 2 * STROKE_WIDTH} x={-(PARAM1 + 2 * STROKE_WIDTH)} y="0px">
          <rect x={STROKE_WIDTH} y={STROKE_WIDTH} rx={PARAM2 / 2} ry={PARAM2 / 2} width={PARAM1} height={PARAM2} stroke="#407AEC" strokeWidth={STROKE_WIDTH} fill="transparent" />
        </svg>
        <svg width={PARAM1 + 2 * STROKE_WIDTH} height={PARAM2 + 2 * STROKE_WIDTH} x={(STROKE_WIDTH)} y="0px">
          <rect x={STROKE_WIDTH} y={STROKE_WIDTH} rx={PARAM2 / 2} ry={PARAM2 / 2} width={PARAM1} height={PARAM2} stroke="#407AEC" strokeWidth={STROKE_WIDTH} fill="transparent" />
        </svg>
        <svg width={PARAM1 + 2 * STROKE_WIDTH} height={PARAM2 + 2 * STROKE_WIDTH} x={-(PARAM1 + 2 * STROKE_WIDTH)} y={DEPTH - PARAM2 - 2 * STROKE_WIDTH}>
          <rect x={STROKE_WIDTH} y={STROKE_WIDTH} rx={PARAM2 / 2} ry={PARAM2 / 2} width={PARAM1} height={PARAM2} stroke="#407AEC" strokeWidth={STROKE_WIDTH} fill="transparent" />
        </svg>
        <svg width={PARAM1 + 2 * STROKE_WIDTH} height={PARAM2 + 2 * STROKE_WIDTH} x={(STROKE_WIDTH)} y={DEPTH - PARAM2 - 2 * STROKE_WIDTH}>
          <rect x={STROKE_WIDTH} y={STROKE_WIDTH} rx={PARAM2 / 2} ry={PARAM2 / 2} width={PARAM1} height={PARAM2} stroke="#407AEC" strokeWidth={STROKE_WIDTH} fill="transparent" />
        </svg>
        <svg width={PARAM2 + 2 * STROKE_WIDTH} height={PARAM1 + 2 * STROKE_WIDTH} x={-(WIDTH) / 2} y={DEPTH / 2 - PARAM1 / 2 - 2 * STROKE_WIDTH}>
          <rect x={STROKE_WIDTH} y={STROKE_WIDTH} rx={PARAM2 / 2} ry={PARAM2 / 2} width={PARAM2} height={PARAM1} stroke="#407AEC" strokeWidth={STROKE_WIDTH} fill="transparent" />
        </svg>
        <svg width={PARAM2 + 2 * STROKE_WIDTH} height={PARAM1 + 2 * STROKE_WIDTH} x={(WIDTH) / 2 - PARAM2 - 2 * STROKE_WIDTH} y={DEPTH / 2 - PARAM1 / 2 - 2 * STROKE_WIDTH}>
          <rect x={STROKE_WIDTH} y={STROKE_WIDTH} rx={PARAM2 / 2} ry={PARAM2 / 2} width={PARAM2} height={PARAM1} stroke="#407AEC" strokeWidth={STROKE_WIDTH} fill="transparent" />
        </svg>

        <image href="/assets/enable.png" style={STYLE_PNG_BASE}/>
       
      </g>
    ) : (
      <g transform={`translate(${0},${-DEPTH / 2})`} width={WIDTH} height={DEPTH}>
        <polygon points={`${poly01 + " " + poly02 + " " + poly03 + " " + poly04}`} style={STYLE_TRANPARENT} />
        <polygon points={`${poly11 + " " + poly12 + " " + poly13 + " " + poly14}`} style={STYLE_RECT} />
        <polygon points={`${poly21 + " " + poly22 + " " + poly23 + " " + poly24}`} style={STYLE_RECT} />
        <polygon points={`${poly31 + " " + poly32 + " " + poly33 + " " + poly34}`} style={STYLE_RECT} />
        <polygon points={`${poly41 + " " + poly42 + " " + poly43 + " " + poly44}`} style={STYLE_RECT} />
        <svg width={PARAM1 + 2 * STROKE_WIDTH} height={PARAM2 + 2 * STROKE_WIDTH} x={-(PARAM1 + 2 * STROKE_WIDTH)} y="0px">
          <rect x={STROKE_WIDTH} y={STROKE_WIDTH} rx={PARAM2 / 2} ry={PARAM2 / 2} width={PARAM1} height={PARAM2} stroke="#8E9BA2" strokeWidth={STROKE_WIDTH} fill="transparent" />
        </svg>
        <svg width={PARAM1 + 2 * STROKE_WIDTH} height={PARAM2 + 2 * STROKE_WIDTH} x={(STROKE_WIDTH)} y="0px">
          <rect x={STROKE_WIDTH} y={STROKE_WIDTH} rx={PARAM2 / 2} ry={PARAM2 / 2} width={PARAM1} height={PARAM2} stroke="#8E9BA2" strokeWidth={STROKE_WIDTH} fill="transparent" />
        </svg>
        <svg width={PARAM1 + 2 * STROKE_WIDTH} height={PARAM2 + 2 * STROKE_WIDTH} x={-(PARAM1 + 2 * STROKE_WIDTH)} y={DEPTH - PARAM2 - 2 * STROKE_WIDTH}>
          <rect x={STROKE_WIDTH} y={STROKE_WIDTH} rx={PARAM2 / 2} ry={PARAM2 / 2} width={PARAM1} height={PARAM2} stroke="#8E9BA2" strokeWidth={STROKE_WIDTH} fill="transparent" />
        </svg>
        <svg width={PARAM1 + 2 * STROKE_WIDTH} height={PARAM2 + 2 * STROKE_WIDTH} x={(STROKE_WIDTH)} y={DEPTH - PARAM2 - 2 * STROKE_WIDTH}>
          <rect x={STROKE_WIDTH} y={STROKE_WIDTH} rx={PARAM2 / 2} ry={PARAM2 / 2} width={PARAM1} height={PARAM2} stroke="#8E9BA2" strokeWidth={STROKE_WIDTH} fill="transparent" />
        </svg>
        <svg width={PARAM2 + 2 * STROKE_WIDTH} height={PARAM1 + 2 * STROKE_WIDTH} x={-(WIDTH) / 2} y={DEPTH / 2 - PARAM1 / 2 - 2 * STROKE_WIDTH}>
          <rect x={STROKE_WIDTH} y={STROKE_WIDTH} rx={PARAM2 / 2} ry={PARAM2 / 2} width={PARAM2} height={PARAM1} stroke="#8E9BA2" strokeWidth={STROKE_WIDTH} fill="transparent" />
        </svg>
        <svg width={PARAM2 + 2 * STROKE_WIDTH} height={PARAM1 + 2 * STROKE_WIDTH} x={(WIDTH) / 2 - PARAM2 - 2 * STROKE_WIDTH} y={DEPTH / 2 - PARAM1 / 2 - 2 * STROKE_WIDTH}>
          <rect x={STROKE_WIDTH} y={STROKE_WIDTH} rx={PARAM2 / 2} ry={PARAM2 / 2} width={PARAM2} height={PARAM1} stroke="#8E9BA2" strokeWidth={STROKE_WIDTH} fill="transparent" />
        </svg>
      </g>
    );
  },

  render3D: function (element, layer, scene) {
    return null;
  }

};
