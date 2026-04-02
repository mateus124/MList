import { useState } from "react";
import { TbLinkPlus } from "react-icons/tb";
import { CiMenuKebab } from "react-icons/ci";
import CardItem from '../CardItem/CardItem';
import Modal from '../Modal/Modal';
import AddLinkModal from '../AddLinkModal/AddLinkModal';
import useLocalStorage from '../../hooks/useLocalStorage';
import styles from './Card.module.css';

const Card = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { data: links, saveToStorage } = useLocalStorage('mlist_tech_links');

    const handleAddLink = (newLink) => {
        const updatedLinks = [...links, { label: newLink.title, href: newLink.url }];
        saveToStorage(updatedLinks);
        setIsModalOpen(false);
    };

    return (
        <>
            <div className={styles.card}>
                <div className={styles.header}>
                    <h3>TECH</h3>
                    <div className={styles.actions}>
                        <button 
                            title="Adicionar Link"
                            onClick={() => setIsModalOpen(true)}
                        >
                            <TbLinkPlus size={20}/>
                        </button>
                        <button title="Opções"><CiMenuKebab size={20}/></button>
                    </div>
                </div>
                <div className={styles.content}>
                    {links.map((link, index) => (
                        <CardItem 
                            key={index}
                            label={link.label} 
                            href={link.href} 
                        />
                    ))}
                </div>
            </div>

            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                title="Adicionar Link"
            >
                <AddLinkModal 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onAddLink={handleAddLink}
                />
            </Modal>
        </>
    )
}

export default Card