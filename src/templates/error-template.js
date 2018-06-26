import styles from '../styles.css';

export const errorTemplate = `
    <div class=${styles.error}>
       {{errorText}}
       <p style="text-align: center">pls reload page</p>
    </div>
`;
