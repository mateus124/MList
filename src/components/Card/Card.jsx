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
    const [editingIndex, setEditingIndex] = useState(null);
    const { data: links, saveToStorage } = useLocalStorage('mlist_tech_links');

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingIndex(null);
    };

    const handleSubmitLink = (newLink) => {
        const normalizedLink = { label: newLink.title, href: newLink.url };
        const updatedLinks =
            editingIndex === null
                ? [...links, normalizedLink]
                : links.map((link, index) => (index === editingIndex ? normalizedLink : link));

        saveToStorage(updatedLinks);
        closeModal();
    };

    const handleDeleteLink = (indexToDelete) => {
        const updatedLinks = links.filter((_, index) => index !== indexToDelete);
        saveToStorage(updatedLinks);
    };

    return (
        <>
            <div className={styles.card}>
                <div className={styles.header}>
                    <h3>TECH</h3>
                    <div className={styles.actions}>
                        <button 
                            title="Adicionar Link"
                            onClick={() => {
                                setEditingIndex(null);
                                setIsModalOpen(true);
                            }}
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
                            onEdit={() => {
                                setEditingIndex(index);
                                setIsModalOpen(true);
                            }}
                            onDelete={() => handleDeleteLink(index)}
                        />
                    ))}
                </div>
            </div>

            <Modal 
                isOpen={isModalOpen} 
                onClose={closeModal}
                title={editingIndex === null ? "Adicionar Link" : "Editar Link"}
            >
                <AddLinkModal 
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    onAddLink={handleSubmitLink}
                    initialData={
                        editingIndex === null
                            ? { url: '', title: '' }
                            : {
                                url: links[editingIndex]?.href ?? '',
                                title: links[editingIndex]?.label ?? '',
                            }
                    }
                    submitLabel={editingIndex === null ? 'Adicionar' : 'Salvar'}
                />
            </Modal>
        </>
    )
}

export default Card