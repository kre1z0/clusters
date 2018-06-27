import fetchJsonp from "fetch-jsonp";
import mustache from "mustache";
// https://goodies.pixabay.com/javascript/auto-complete/demo.html
import AutoComplete from "javascript-autocomplete";
import { init } from "../sgis/init";
import { TileLayer } from "../sgis/layers/TileLayer";
import { PointFeature } from "../sgis/features/PointFeature";
import { Point } from "../sgis/Point";
import { wgs84 } from "../sgis/Crs";
import { ClusterLayer } from "../sgis/layers/ClusterLayer";
import { ClusterSymbol } from "../sgis/symbols/ClusterSymbol";
import { DynamicImageSymbol } from "../sgis/symbols/point/DynamicImageSymbol";

import { GridClusterProvider } from "../sgis/layers/clusterProviders/GridClusterProvider";
import yarmarkaIcon from "../icons/Yarmarka.svg";
import yarmarkaIconSelected from "../icons/Yarmarka_selected.svg";
import { zoomPanelTemplate } from "../templates/zoom-plugin-template";
import { AutoCompleteTemplate } from "../templates/autocomplete-template";
import { errorTemplate } from "../templates/error-template";
import { licenseTepmlate } from "../templates/license-template";
import Popup from "../components/Popup";
import styles from "../styles.css";

const isProduction = process.env.NODE_ENV === "production";

const apiUrl = isProduction
  ? "https://navigator.smbn.ru/"
  : "https://msp.everpoint.ru/";

class Map {
  constructor() {
    this.init();
    this.mapWrapperId = styles.mapContainer;
    this.mapNode = document.getElementById(this.mapWrapperId);
    this._selectedClusterSymbol = new ClusterSymbol({
      borderColor: "#fa0",
    });
    this._selectedSymbol = new DynamicImageSymbol({
      source: yarmarkaIconSelected,
      width: 40,
      height: 51,
      anchorPoint: [40 / 2, 51],
    });
    this._features = [];
    this._selectedObject = 0;
    this.onFeatureClick = this.onFeatureClick.bind(this);
    this.onChangeCard = this.onChangeCard.bind(this);
    this.clearSelection = this.clearSelection.bind(this);
    this.setSelection = this.setSelection.bind(this);
    this.subjectChange = this.subjectChange.bind(this);
  }

  fetchData() {
    return fetchJsonp(`${apiUrl}api/service/fair.jsonp`, {
      jsonpCallbackFunction: "callback",
    })
      .then(res => res.json())
      .then(json => json)
      .catch(ex => {
        const wrapper = document.createElement("div");
        const map = document.getElementById(this.mapWrapperId);
        const error = mustache.render(errorTemplate, { errorText: ex });
        wrapper.innerHTML = `${error}`;
        if (map) {
          map.appendChild(wrapper);
        }
      });
  }

  clearSelection() {
    if (this.selectedFeature) {
      this.selectedFeature.clearTempSymbol();
      this.selectedFeature.__dynamicSymbolRender = null;
      this._layer.redraw();
      this.selectedFeature = null;
    }
  }

  setSelection(feature) {
    this.selectedFeature = feature;
    this.selectedFeature.__dynamicSymbolRender = null;
    if (feature.features.length > 1) {
      this._selectedClusterSymbol.getNode(feature).style.cursor = "default";
      feature.setTempSymbol(this._selectedClusterSymbol);
    } else {
      this._selectedSymbol.getNode(feature).style.cursor = "default";
      feature.setTempSymbol(this._selectedSymbol);
    }
    this._layer.redraw();
  }

  onChangeCard(index) {
    const lastIndex = this._features.length - 1;

    if (this._selectedObject === 0 && index < 0) {
      this._selectedObject = lastIndex;
    } else if (this._selectedObject === lastIndex && index > 0) {
      this._selectedObject = 0;
    } else {
      this._selectedObject = this._selectedObject + index;
    }

    this.popupRender(this._selectedObject);
  }

  popupRender(index) {
    const properties = this._features[index].properties;
    const props = {
      name: properties.name,
      assortmentOfgoods: properties.fields[1].value,
      address: properties.address,
      periodicity: properties.fields[0].value,
      amount: this._features.length,
      currentObject: index + 1,
    };

    if (this.mapNode) {
      const prevPopup = document.querySelector(`.${styles.popup}`);

      const popupOptions = {
        container: this.mapNode,
        props,
        animationContent: true,
        closePopupCallback: this.clearSelection,
        onChangeCard: this.onChangeCard,
      };

      if (prevPopup) {
        this.mapNode.removeChild(prevPopup);
        this.popup = new Popup(popupOptions).renderPopup();
      } else {
        popupOptions.animationContent = false;
        this.popup = new Popup(popupOptions).renderPopup();
      }
    }
  }

  onFeatureClick(feature) {
    if (this.selectedFeature === feature) return;
    this._selectedObject = 0;
    if (this.mapNode) {
      this.clearSelection();
      this.setSelection(feature);
    }

    this._features = feature.features;
    this.popupRender(this._selectedObject);
  }

  onZoom(value) {
    this.map.zoom(value);
  }

  initZoomPlugin() {
    const wrapper = document.createElement("div");
    const zoomPanel = mustache.render(zoomPanelTemplate);
    if (this.mapNode) {
      wrapper.classList.add(styles.zoomPanel);
      wrapper.innerHTML = zoomPanel;
      this.mapNode.appendChild(wrapper);
      const zoomIn = document.querySelector(`.${styles.zoomIn}`);
      const zoomOut = document.querySelector(`.${styles.zoomOut}`);
      zoomIn.addEventListener("click", () => this.onZoom(1));
      zoomOut.addEventListener("click", () => this.onZoom(-1));
    }
  }

  subjectChange(e) {
    const value = e.target.value;
    if (value === "") {
      this.subjectFiltering();
    }
  }

  initAutoComplete(subjects = []) {
    const items = subjects.map(({ name }) => name);
    const wrapper = document.createElement("div");
    const autoComplete = mustache.render(AutoCompleteTemplate);
    if (this.mapNode) {
      wrapper.classList.add(styles.autocompleteContainer);
      wrapper.innerHTML = autoComplete;
      this.mapNode.appendChild(wrapper);
      const initAutoComplete = new AutoComplete({
        selector: "#autocomplete-map-widget",
        minChars: 1,
        onSelect: (event, term, item) => {
          const isContain = items.some(subject => term === subject);
          if (isContain) {
            const selectedId = subjects.find(({ name }) => name === term).id;
            event.target.value = term;
            this.subjectFiltering(selectedId);
          }
        },
        source: (term, suggest) => {
          const termLC = term.toLowerCase();
          const filteredItems = items.filter(
            item => item && item.toLowerCase().search(termLC) !== -1,
          );
          suggest(filteredItems);
        },
      });
    }
    const input = document.getElementById("autocomplete-map-widget");
    input.addEventListener("input", this.subjectChange);
  }

  subjectFiltering(subjectId) {
    if (subjectId) {
      const filteredData = this.data.filter(
        ({ properties: { subject_id } }) => subject_id === subjectId,
      );
      this.initLayer(filteredData);
    } else {
      this.initLayer(this.data);
    }
  }

  initLayer(data) {
    if (this._layer) {
      this.map.removeLayer(this._layer);
    }
    const symbol = new DynamicImageSymbol({
      source: yarmarkaIcon,
      width: 40,
      height: 51,
      anchorPoint: [40 / 2, 51],
    });

    const featureClusterLayer = new ClusterLayer({
      gridClusterProvider: new GridClusterProvider(),
      clusterSymbol: new ClusterSymbol({ borderColor: "#668A2C" }),
      callback: this.onFeatureClick,
    });

    const features = data.map( ({ geometry, properties }) => {
      const feature = new PointFeature(geometry.coordinates, {
        symbol,
        crs: wgs84,
      });
      feature.properties = properties;
      return feature;
    });
    featureClusterLayer.add(features);
    this.map.addLayer(featureClusterLayer);
    this._layer = featureClusterLayer;
  }

  init() {
    this.fetchData().then(data => {
      const resolution = 9595;

      const { map } = init({
        wrapper: styles.mapContainer,
        layers: [
          new TileLayer(
            "http://tile1.maps.2gis.com/tiles?x={x}&y={y}&z={z}&v=40",
          ),
        ],
        centerPoint: new Point([58, 92]),
        resolution,
      });

      map.maxResolution = 9601;

      const licenseWrapper = document.createElement("div");
      licenseWrapper.innerHTML = mustache.render(licenseTepmlate);
      this.mapNode.appendChild(licenseWrapper);
      this.data = data.features.features;
      this.map = map;

      this.initLayer(data.features.features);
      this.initZoomPlugin();
      this.initAutoComplete(data.subjects);
    });
  }
}

export default Map;
