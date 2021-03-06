import { DynamicPointSymbol } from "sgis/dist/symbols/Symbol";
import { setCssClasses } from "sgis/dist/utils/utils";
import { SvgRender } from "../sgis/painters/DomPainter/SvgRender";

const DEFAULT_WRAPPER_CLASS_NAME = "sGis-dynamicCluster";
const DEFAULT_WRAPPER_STYLE = `
    display: -ms-flexbox;
    display: flex;
    -ms-flex-align: center;
    align-items: center;
    -ms-flex-pack: center;
    justify-content: center;
`;
setCssClasses({ [DEFAULT_WRAPPER_CLASS_NAME]: DEFAULT_WRAPPER_STYLE });

const DEFAULT_SVG_CLASS_NAME = "sGis-dynamicClusterSVG";
const DEFAULT_SVG_STYLE = `
    overflow: visible;
    top: 0;
    left: 0;
    position: absolute;
`;
setCssClasses({ [DEFAULT_SVG_CLASS_NAME]: DEFAULT_SVG_STYLE });

const DEFAULT_LABEL_CLASS_NAME = "sGis-dynamicClusterLabel";
const DEFAULT_LABEL_STYLE = `
    z-index: 1;
    font-size: 13px;
`;
setCssClasses({ [DEFAULT_LABEL_CLASS_NAME]: DEFAULT_LABEL_STYLE });

export class ClusterSymbol extends DynamicPointSymbol {
  constructor({
    wrapperClassNames = "",
    svgClassNames = "",
    labelClassNames = "",
    offset,
    size = 44,
    strokeWidth = 6,
    values = [],
    colors = [],
    fill = "#fff",
    stroke = "#89CCF1",
  } = {}) {
    super({ offset });
    this.wrapperClassNames = wrapperClassNames
      ? [DEFAULT_WRAPPER_CLASS_NAME].concat(wrapperClassNames.split(" "))
      : [DEFAULT_WRAPPER_CLASS_NAME];

    this.svgClassNames = svgClassNames
      ? [DEFAULT_SVG_CLASS_NAME].concat(svgClassNames.split(" "))
      : [DEFAULT_SVG_CLASS_NAME];

    this.labelClassNames = labelClassNames
      ? [DEFAULT_LABEL_CLASS_NAME].concat(labelClassNames.split(" "))
      : [DEFAULT_LABEL_CLASS_NAME];

    this.size = size;
    this.strokeWidth = strokeWidth;
    this.values = values;
    this.colors = colors;
    this.fill = fill;
    this.stroke = stroke;
  }

  polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;

    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  }

  describeArc(x, y, radius, startAngle, endAngle) {
    const start = this.polarToCartesian(x, y, radius, endAngle);
    const end = this.polarToCartesian(x, y, radius, startAngle);

    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    const d = [
      "M",
      start.x,
      start.y,
      "A",
      radius,
      radius,
      0,
      largeArcFlag,
      0,
      end.x,
      end.y,
    ].join(" ");

    return d;
  }

  _getFeatureNode(feature) {
    const labelFeature = feature;

    const wrapper = document.createElement("div");
    const label = document.createElement("div");

    const radius = this.size / 2;
    const r2 = this.size + this.strokeWidth;
    const c = radius + this.strokeWidth / 2;
    const svg = new SvgRender()._getCircle({
      r: radius,
      cx: c,
      cy: c,
      stroke: this.stroke,
      "stroke-width": this.strokeWidth,
      fill: this.fill,
      width: r2,
      height: r2,
      viewBox: [0, 0, r2, r2].join(" "),
    });

    const convertValuesToDeg = values => {
      const sum = values.reduce((a, b) => a + b, 0);
      return values.map(n => parseFloat((360 * n / sum).toFixed(1)));
    };

    let startAngle = 0;
    let endAngle = 0;

    convertValuesToDeg(this.values).forEach((value, index) => {
      endAngle += value;
      const path = new SvgRender()._getPathNode({
        d: this.describeArc(c, c, radius, startAngle, endAngle),
        fill: "transparent",
        stroke: this.colors[index],
        "stroke-width": this.strokeWidth,
        width: r2,
        height: r2,
        viewBox: [0, 0, r2, r2].join(" "),
      }).childNodes[0];
      svg.appendChild(path);
      startAngle += value;
    });

    label.innerText = labelFeature.content;

    wrapper.style.width = `${this.size + this.strokeWidth}px`;
    wrapper.style.height = `${this.size + this.strokeWidth}px`;

    wrapper.classList.add(...this.wrapperClassNames);
    svg.classList.add(...this.svgClassNames);
    label.classList.add(...this.labelClassNames);

    wrapper.appendChild(svg);
    wrapper.appendChild(label);

    return wrapper;
  }
}
