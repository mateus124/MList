import styles from './UpdateNotice.module.css';

const UpdateNotice = ({ latestVersion, onUpdateNow, onDismiss }) => {
  if (!latestVersion) return null;

  return (
    <aside className={styles.notice} role="status" aria-live="polite">
      <div className={styles.content}>
        <strong>Nova versao disponivel</strong>
        <p>Existe uma nova versao ({latestVersion}). Atualize agora.</p>
      </div>
      <div className={styles.actions}>
        <button type="button" className={styles.secondary} onClick={onDismiss}>
          Fechar
        </button>
        <button type="button" className={styles.primary} onClick={onUpdateNow}>
          Atualizar agora
        </button>
      </div>
    </aside>
  );
};

export default UpdateNotice;
