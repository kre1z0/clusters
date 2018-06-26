import { StaticVectorImageRender } from '../sgis/renders/StaticVectorImageRender';
import { Symbol } from '../sgis/symbols/Symbol';
import { DynamicImageSymbol } from '../sgis/symbols/point/DynamicImageSymbol';

const staticResolution = 611.4962262812505;

const iconWidth = 40;
const iconHeight = 51;

export class StaticPin extends StaticVectorImageRender {
    constructor(node, position) {
        super({
            position,
            height: iconHeight,
            width: iconWidth,
            offset: [-iconWidth / 2, -iconHeight],
        });
        this.opacity = 0;

        this._node = node;
    }

    _createNode() {}
    get isReady() {
        return true;
    }
}

export class RamblerSymbol extends Symbol {
    constructor(imageSrc) {
        super();

        this._staticImage = document.createElement('img');
        this._staticImage.src = imageSrc;

        this._dynamicSymbol = new DynamicImageSymbol({
            source: imageSrc,
            width: iconWidth,
            height: iconHeight,
            anchorPoint: [iconWidth / 2, iconHeight],
        });
    }

    renderFunction(feature, resolution, crs) {
        if (resolution >= staticResolution) {
            let position = feature.projectTo(crs).position;
            let pxPosition = [position[0] / resolution, -position[1] / resolution];
            return [new StaticPin(this._staticImage, pxPosition)];
        } else {
            return this._dynamicSymbol.renderFunction(feature, resolution, crs);
        }
    }
}
