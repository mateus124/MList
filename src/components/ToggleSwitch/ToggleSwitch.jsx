import styles from './ToggleSwitch.module.css';

const ToggleSwitch = ({ checked, onChange }) => {
    return (
        <label className={styles.toggleLabel}>
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className={styles.input}
            />
            <span className={styles.slider} />
        </label>
    );
};

export default ToggleSwitch;
