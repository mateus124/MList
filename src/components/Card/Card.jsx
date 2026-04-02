import { TbLinkPlus } from "react-icons/tb";
import { CiMenuKebab } from "react-icons/ci";
import styles from './Card.module.css';

const Card = () => {
    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <h3>TECH</h3>
                <div className={styles.actions}>
                    <button><TbLinkPlus size={20}/></button>
                    <button><CiMenuKebab size={20}/></button>
                </div>
            </div>
            <div className="content">

            </div>
        </div>
    )
}

export default Card