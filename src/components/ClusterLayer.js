import { Layer } from "sgis/dist/layers/Layer";
import { wgs84, geo, webMercator } from "../sgis/Crs";
import { error } from "../sgis/utils/utils";
import { sGisEvent } from "../sgis/EventHandler";
import { StaticImageRender } from "../sgis/renders/StaticImageRender";
import { PointFeature } from "../sgis/features/PointFeature";
import { FeatureGroup } from "../sgis/features/FeatureGroup";
import { ClusterSymbol } from "../sgis/symbols/ClusterSymbol";
import yarmarkaIcon from "../icons/Yarmarka.svg";
import { RamblerSymbol } from "../components/RamblerSymbol";
import ceil from "lodash/ceil";
import round from "lodash/round";

import styles from "../styles.css";

/**
 * New features are added to the feature layer
 * @event FeaturesAddEvent
 */
export class FeaturesAddEvent extends sGisEvent {
  constructor(features) {
    super(FeaturesAddEvent.type);
    this.features = features;
  }
}

FeaturesAddEvent.type = "featuresAdd";

export class ClusterLayer extends Layer {
  constructor(features = []) {
    super();
    this._features = features;
  }
  getRenders(bbox, resolution) {
    let renders = [];

    const t0 = performance.now();

    this.getClusters(bbox, resolution).forEach(cluster => {
      const img = document.createElement("img");
      img.src = yarmarkaIcon;

      let symbol = new ClusterSymbol({
        values: [233, 144, 555, 340],
        colors: ["red", "green", "blue", "yellow", "gray"],
        count: cluster._features.length,
      });

      let feature = new PointFeature(cluster.centroid, {
        symbol,
        crs: wgs84,
      });

      renders = renders.concat(feature.render(resolution, bbox.crs));
      renders.forEach(render => {
        if (render instanceof StaticImageRender) {
          render.onLoad = () => {
            this.redraw();
          };
        }
      });
    });

    const t1 = performance.now();

    console.log(
      "Performance getRenders " + ceil((t1 - t0) / 1000, 3) + " seconds.",
    );

    return renders;
  }

  getClusters(bbox, resolution) {
    //console.log('--> xMin', bbox.xMin / resolution);
    //console.log('--> xMax', bbox.xMax / resolution);
    //console.log('--> yMin', bbox.yMin / resolution);
    //console.log('--> yMax', bbox.yMax / resolution);
    const t0 = performance.now();

    if (!this.checkVisibility(resolution)) return [];

    const features = this._features.filter(feature => {
      return (
        feature.crs.canProjectTo(bbox.crs) &&
        (feature.persistOnMap || feature.bbox.intersects(bbox))
      );
    });

    console.log("--> features", features);

    const group = new FeatureGroup(features, {
      crs: wgs84,
    });

    return [group];
  }

  add(features) {
    const toAdd = Array.isArray(features) ? features : [features];
    if (toAdd.length === 0) return;
    toAdd.forEach(f => {
      if (this._features.indexOf(f) !== -1)
        error(new Error(`Feature ${f} is already in the layer`));
    });
    this._features = this._features.concat(toAdd);
    this.fire(new FeaturesAddEvent(toAdd));
    this.redraw();
  }
}
