import { TbLinkPlus } from "react-icons/tb";
import { CiMenuKebab } from "react-icons/ci";
import CardItem from '../CardItem/CardItem';
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
            <div className={styles.content}>
                <CardItem 
                    label="GitHub" 
                    href="https://github.com" 
                />
                <CardItem 
                    label="Figma" 
                    href="https://figma.com" 
                />
                <CardItem 
                    label="Stitch" 
                    href="https://stitch.withgoogle.com" 
                />
            </div>
        </div>
    )
}

export default Card