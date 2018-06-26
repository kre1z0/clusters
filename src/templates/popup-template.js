import styles from '../styles.css';

export const popupTemplate = `
    <div class=${styles.popupContent}>
        <div class=${styles.header}>
            <div class=${styles.headerTitle}>{{name}}</div>
            <div class=${styles.headerSubtitle}>{{assortmentOfgoods}}</div>
        </div>
        <div>
            <div class=${styles.row}>
                <div class=${styles.address}>
                    <div class=${styles.silverCircle}></div>
                    {{address}}
                </div>
            </div>
            <div class=${styles.row}>
                <div class=${styles.periodicity}>
                    <div class=${styles.timeIcon}></div>
                        {{periodicity}}
                    </div>
            </div>
        </div>
    </div>
`;

export const popupFooterTemplate = `
    <div class=${styles.popupFooter}>
        <div class=${styles.prev}></div>
        <div class=${styles.amount}>{{currentObject}} из {{amount}}</div>
        <div class=${styles.next}></div>
    </div>
`;
