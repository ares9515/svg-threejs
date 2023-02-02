import * as Three from 'three';
import React from 'react';

const ZOOM = 5;
const WIDTH = 21.89 * ZOOM;
const DEPTH = 22.51 * ZOOM;
const STROKE_WIDTH = 3;
const INNER_WIDTH = 17.82 * ZOOM;
const INNER_HEIGHT = 18.32 * ZOOM;
const CIRCLE_RADIUS = 1 * ZOOM;
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
  transform: 'translate(8px, 26.95px)'
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
  name: 'shower',
  prototype: 'items',

  info: {
    tag: ['shower', 'shower'],
    title: 'shower',
    description: 'shower',
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
    const half_thickness = 1;
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

    let dis1 = 0, dis2 = 0, dis3 = 0, dis4 = 0;

    lines.map(line => {
      if(line.y1 > y + DEPTH / 2 && ((line.x1 <= x && line.x2 >= x) || (line.x2 <= x && line.x1 >= x))) {
        if(dis1 == 0) {
          dis1 = line.y1 - y - DEPTH / 2;
        } else if (dis1 > line.y1 - y - DEPTH / 2) {
          dis1 = line.y1 - y - DEPTH / 2;
        }
      } else if(line.y1 < y - DEPTH / 2 && ((line.x1 <= x && line.x2 >= x) || (line.x2 <= x && line.x1 >= x))) {
        if(dis2 == 0) {
          dis2 = y - DEPTH / 2 - line.y1;
        } else if (dis2 > y - DEPTH / 2 - line.y1) {
          dis2 = y - DEPTH / 2 - line.y1;
        }
      } else if(line.x1 < x - WIDTH / 2 && ((line.y1 <= y && line.y2 >= y) || (line.y2 <= y && line.y1 >= y))) {
        if(dis3 == 0) {
          dis3 = -line.x1 + x - WIDTH / 2;
        } else if (dis3 > -line.x1 + x - WIDTH / 2) {
          dis3 = -line.x1 + x - WIDTH / 2;
        }
      } else if(line.x1 > x + WIDTH / 2 && ((line.y1 <= y && line.y2 >= y) || (line.y2 <= y && line.y1 >= y))) {
        if(dis4 == 0) {
          dis4 = line.x1 - x - WIDTH / 2;
        } else if (dis4 > line.x1 - x - WIDTH / 2) {
          dis4 = line.x1 - x - WIDTH / 2;
        }
      }
    })
    let poly01 = `${-WIDTH / 2 - half_thickness},${DEPTH + half_thickness}`, poly02 = `${WIDTH / 2 + half_thickness},${DEPTH + half_thickness}`, poly03 = `${WIDTH / 2 + half_thickness},${0}`, poly04 = `${-WIDTH / 2 - half_thickness},${0}`;
    let poly11 = `${-WIDTH / 2},${half_thickness}`, poly12 = `${WIDTH / 2},${half_thickness}`, poly13 = `${WIDTH / 2},-${half_thickness}`, poly14 = `${-WIDTH / 2},-${half_thickness}`;
    let poly21 = `${-WIDTH / 2 - half_thickness},${DEPTH}`, poly22 = `${-WIDTH / 2 + half_thickness},${DEPTH}`, poly23 = `${-WIDTH / 2 + half_thickness},${0}`, poly24 = `${-WIDTH / 2 - half_thickness},${0}`;
    let poly31 = `${WIDTH / 2 - half_thickness},${DEPTH}`, poly32 = `${WIDTH / 2 + half_thickness},${DEPTH}`, poly33 = `${WIDTH / 2 + half_thickness},${0}`, poly34 = `${WIDTH / 2 - half_thickness},${0}`;
    let poly41 = `${-WIDTH / 2},${DEPTH + half_thickness}`, poly42 = `${WIDTH / 2},${DEPTH + half_thickness}`, poly43 = `${WIDTH / 2},${DEPTH - half_thickness}`, poly44 = `${-WIDTH / 2},${DEPTH - half_thickness}`;

    let poly51 = `${-INNER_WIDTH / 2},${half_thickness + (DEPTH - INNER_HEIGHT) / 2}`, poly52 = `${INNER_WIDTH / 2},${half_thickness + (DEPTH - INNER_HEIGHT) / 2}`, poly53 = `${INNER_WIDTH / 2},${-half_thickness + (DEPTH - INNER_HEIGHT) / 2}`, poly54 = `${-INNER_WIDTH / 2},${-half_thickness + (DEPTH - INNER_HEIGHT) / 2}`;
    let poly61 = `${-INNER_WIDTH / 2 - half_thickness},${INNER_HEIGHT + (DEPTH - INNER_HEIGHT) / 2}`, poly62 = `${-INNER_WIDTH / 2 + half_thickness},${INNER_HEIGHT + (DEPTH - INNER_HEIGHT) / 2}`, poly63 = `${-INNER_WIDTH / 2 + half_thickness},${ + (DEPTH - INNER_HEIGHT) / 2}`, poly64 = `${-INNER_WIDTH / 2 - half_thickness},${ + (DEPTH - INNER_HEIGHT) / 2}`;
    let poly71 = `${INNER_WIDTH / 2 - half_thickness},${INNER_HEIGHT + (DEPTH - INNER_HEIGHT) / 2}`, poly72 = `${INNER_WIDTH / 2 + half_thickness},${INNER_HEIGHT + (DEPTH - INNER_HEIGHT) / 2}`, poly73 = `${INNER_WIDTH / 2 + half_thickness},${0 + (DEPTH - INNER_HEIGHT) / 2}`, poly74 = `${INNER_WIDTH / 2 - half_thickness},${ + (DEPTH - INNER_HEIGHT) / 2}`;
    let poly81 = `${-INNER_WIDTH / 2},${INNER_HEIGHT + half_thickness + (DEPTH - INNER_HEIGHT) / 2}`, poly82 = `${INNER_WIDTH / 2},${INNER_HEIGHT + half_thickness + (DEPTH - INNER_HEIGHT) / 2}`, poly83 = `${INNER_WIDTH / 2},${INNER_HEIGHT - half_thickness + (DEPTH - INNER_HEIGHT) / 2}`, poly84 = `${-INNER_WIDTH / 2},${INNER_HEIGHT - half_thickness + (DEPTH - INNER_HEIGHT) / 2}`;
   
    return element.selected ? (
      <g transform={`translate(${0},${-DEPTH / 2})`}>
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
        <polygon points={`${poly51 + " " + poly52 + " " + poly53 + " " + poly54}`} style={STYLE_RECT_SELECTED} />
        <polygon points={`${poly61 + " " + poly62 + " " + poly63 + " " + poly64}`} style={STYLE_RECT_SELECTED} />
        <polygon points={`${poly71 + " " + poly72 + " " + poly73 + " " + poly74}`} style={STYLE_RECT_SELECTED} />
        <polygon points={`${poly81 + " " + poly82 + " " + poly83 + " " + poly84}`} style={STYLE_RECT_SELECTED} />
        <svg height={CIRCLE_RADIUS * 2 + 2 * STROKE_WIDTH} width={CIRCLE_RADIUS * 2 + 2 * STROKE_WIDTH} x={-CIRCLE_RADIUS - STROKE_WIDTH} y={(DEPTH - 2 *  CIRCLE_RADIUS) / 2 - STROKE_WIDTH}>
          <circle cx={CIRCLE_RADIUS  + 3} cy={CIRCLE_RADIUS  + 3} r={CIRCLE_RADIUS} stroke="#407AEC" strokeWidth={1} fill="transparent" />
        </svg>

        <image href="/assets/enable.png" style={STYLE_PNG_BASE}/>
        {dis1 != 0 && <g transform={`translate(${0}, ${DEPTH} )`}>
          <text
            x="20"
            y={-dis1 / 2}
            transform={`scale(1, -1)`}
            style={STYLE_TEXT}
            filter="url(#rounded-corners)"
          >
            {dis1.toFixed(1)}
          </text>
          <line x1="-5" y1={dis1} x2="5" y2={dis1} style={STYLE} />
          <line x1="0" y1="0" x2="0" y2={dis1} style={STYLE} />
        </g>}
        {dis2 != 0 && <g transform={`translate(${0}, ${0} )`}>
          <text
            x="20"
            y={dis2 / 2}
            transform={`scale(1, -1)`}
            style={STYLE_TEXT}
            filter="url(#rounded-corners)"
          >
            {dis2.toFixed(1)}
          </text>
          <line x1="-5" y1={-dis2} x2="5" y2={-dis2} style={STYLE} />
          <line x1="0" y1="0" x2="0" y2={-dis2} style={STYLE} />
        </g>}
        {dis3 != 0 && <g transform={`translate(-${dis3 + WIDTH / 2}, ${DEPTH / 2} )`}>
          <text
            x={dis3 / 2}
            y="-10"
            transform={`scale(1, -1)`}
            style={STYLE_TEXT}
            filter="url(#rounded-corners)"
          >
            {dis3.toFixed(1)}
          </text>
          <line x1={0} y1="-5" x2={0} y2="5" style={STYLE} />
          <line x1="0" y1="0" x2={dis3} y2="0" style={STYLE} />
        </g>}
        {dis4 != 0 && <g transform={`translate(${WIDTH / 2}, ${DEPTH / 2} )`}>
          <text
            x={dis4 / 2}
            y="-10"
            transform={`scale(1, -1)`}
            style={STYLE_TEXT}
            filter="url(#rounded-corners)"
          >
            {dis4.toFixed(1)}
          </text>
          <line x1={dis4} y1="-5" x2={dis4} y2="5" style={STYLE} />
          <line x1="0" y1="0" x2={dis4} y2="0" style={STYLE} />
        </g>}
      </g>
    ) : (
      <g transform={`translate(${0},${-DEPTH / 2})`}>
        <polygon points={`${poly01 + " " + poly02 + " " + poly03 + " " + poly04}`} style={STYLE_TRANPARENT} />
        <polygon points={`${poly11 + " " + poly12 + " " + poly13 + " " + poly14}`} style={STYLE_RECT} />
        <polygon points={`${poly21 + " " + poly22 + " " + poly23 + " " + poly24}`} style={STYLE_RECT} />
        <polygon points={`${poly31 + " " + poly32 + " " + poly33 + " " + poly34}`} style={STYLE_RECT} />
        <polygon points={`${poly41 + " " + poly42 + " " + poly43 + " " + poly44}`} style={STYLE_RECT} />
        <polygon points={`${poly51 + " " + poly52 + " " + poly53 + " " + poly54}`} style={STYLE_RECT} />
        <polygon points={`${poly61 + " " + poly62 + " " + poly63 + " " + poly64}`} style={STYLE_RECT} />
        <polygon points={`${poly71 + " " + poly72 + " " + poly73 + " " + poly74}`} style={STYLE_RECT} />
        <polygon points={`${poly81 + " " + poly82 + " " + poly83 + " " + poly84}`} style={STYLE_RECT} />
        <svg height={CIRCLE_RADIUS * 2 + 2 * STROKE_WIDTH} width={CIRCLE_RADIUS * 2 + 2 * STROKE_WIDTH} x={-CIRCLE_RADIUS - STROKE_WIDTH} y={(DEPTH - 2 *  CIRCLE_RADIUS) / 2 - STROKE_WIDTH}>
          <circle cx={CIRCLE_RADIUS  + 3} cy={CIRCLE_RADIUS  + 3} r={CIRCLE_RADIUS} stroke="#8E9BA2" strokeWidth={1} fill="transparent" />
        </svg>
      </g>
    );
  },

  render3D: function (element, layer, scene) {
    return null;
  }

};