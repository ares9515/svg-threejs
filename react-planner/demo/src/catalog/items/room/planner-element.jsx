import * as Three from 'three';
import React from 'react';

const WIDTH=150;
const DEPTH=150;
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
  transform: 'translate(80px, 50px)'
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
  name: 'room',
  prototype: 'items',

  info: {
    tag: ['room', 'wall'],
    title: 'room',
    description: 'room',
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
    const half_thickness = 5;
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

    let poly01 = `${-half_thickness},${DEPTH + half_thickness}`, poly02 = `${WIDTH + half_thickness},${DEPTH + half_thickness}`, poly03 = `${WIDTH + half_thickness},${0}`, poly04 = `${- half_thickness},${0}`;
    let poly11 = `${half_thickness},${half_thickness}`, poly12 = `${length - half_thickness},${half_thickness}`, poly13 = `${length + half_thickness},${-half_thickness}`, poly14 = `-${half_thickness},-${half_thickness}`;
    let poly21 = `${-half_thickness},${DEPTH + half_thickness}`, poly22 = `${length + half_thickness},${DEPTH + half_thickness}`, poly23 = `${length - half_thickness},${DEPTH - half_thickness}`, poly24 = `${half_thickness}, ${DEPTH - half_thickness}`;
    let poly31 = `${-half_thickness},${DEPTH + half_thickness}`, poly32 = `${half_thickness},${DEPTH - half_thickness}`, poly33 = `${half_thickness},${half_thickness}`, poly34 = `${-half_thickness}, -${half_thickness}`;
    let poly41 = `${WIDTH -half_thickness},${DEPTH - half_thickness}`, poly42 = `${WIDTH + half_thickness},${DEPTH + half_thickness}`, poly43 = `${WIDTH + half_thickness},-${half_thickness}`, poly44 = `${WIDTH -half_thickness}, ${half_thickness}`;

    return element.selected ? (
      <g transform={`translate(${-WIDTH / 2},${-DEPTH / 2})`} width={WIDTH} height={DEPTH} lines={lines} x={x} y={y}>
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
        <image href="/assets/enable.png" style={STYLE_PNG_BASE}/>
       
      </g>
    ) : (
      <g transform={`translate(${-WIDTH / 2},${-DEPTH / 2})`} width={WIDTH} height={DEPTH}>
        <polygon points={`${poly01 + " " + poly02 + " " + poly03 + " " + poly04}`} style={STYLE_TRANPARENT} />
        <polygon points={`${poly11 + " " + poly12 + " " + poly13 + " " + poly14}`} style={STYLE_RECT} />
        <polygon points={`${poly21 + " " + poly22 + " " + poly23 + " " + poly24}`} style={STYLE_RECT} />
        <polygon points={`${poly31 + " " + poly32 + " " + poly33 + " " + poly34}`} style={STYLE_RECT} />
        <polygon points={`${poly41 + " " + poly42 + " " + poly43 + " " + poly44}`} style={STYLE_RECT} />
      </g>
    );
  },

  render3D: function (element, layer, scene) {
    return null;
  }

};
