import styles from '../styles.css';

export const zoomPanelTemplate = `
    <svg viewBox="0 0 40 73" style="enable-background:new 0 0 40 73;" xml:space="preserve">
        <g>
            <path style="opacity: 0.4" id="back" d="M26.3,42.3C24,41,24,40,26.1,39.1C34.1,36.5,40,28.9,40,20C40,9,31,0,20,0C9,0,0,9,0,20
            c0,8.9,5.9,16.5,13.9,19.1C16,40,16,41,13.7,42.3C8,44.7,4,50.4,4,57c0,8.8,7.2,16,16,16s16-7.2,16-16C36,50.4,32,44.7,26.3,42.3z"
    />
            <path class=${
                styles.zoomIn
            } style="fill: #FFFFFF" id="c_x5F_plus" d="M20,37.5c-9.6,0-17.5-7.9-17.5-17.5S10.4,2.5,20,2.5S37.5,10.4,37.5,20S29.6,37.5,20,37.5z"/>
            <path  class=${
                styles.zoomOut
            } style="fill: #FFFFFF" id="c_x5F_minus" d="M20,70.5c-7.4,0-13.5-6.1-13.5-13.5S12.6,43.5,20,43.5S33.5,49.6,33.5,57S27.4,70.5,20,70.5z"/>
            <g id="minus">
            <polygon points="27,19 21,19 21,13 19,13 19,19 13,19 13,21 19,21 19,27 21,27 21,21 27,21 		"/>
            </g>
            <rect id="plus" x="14" y="56" width="12" height="2"/>
        </g>
    </svg>
`;
