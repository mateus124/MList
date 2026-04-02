import { useEffect, useRef, useState } from "react";
import { TbLinkPlus } from "react-icons/tb";
import { CiMenuKebab } from "react-icons/ci";
import CardItem from '../CardItem/CardItem';
import Modal from '../Modal/Modal';
import AddLinkModal from '../AddLinkModal/AddLinkModal';
import CardMenu from '../CardMenu/CardMenu';
import BoardTitleModal from '../BoardTitleModal/BoardTitleModal';
import ConfirmModal from '../ConfirmModal/ConfirmModal';
import useLocalStorage from '../../hooks/useLocalStorage';
import styles from './Card.module.css';

const Card = ({ title, cardId, columnId, onRenameBoard, onDeleteBoard }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isEditBoardOpen, setIsEditBoardOpen] = useState(false);
    const [isDeleteBoardOpen, setIsDeleteBoardOpen] = useState(false);
    const menuRef = useRef(null);
    const linksStorageKey = `mlist_${columnId}_${cardId}_links`;
    const { data: links, saveToStorage } = useLocalStorage(linksStorageKey, []);

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, []);

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

    const handleOpenAllLinks = () => {
        links.forEach((link) => {
            window.open(link.href, '_blank', 'noopener,noreferrer');
        });
        setIsMenuOpen(false);
    };

    const handleEditBoard = () => {
        setIsMenuOpen(false);
        setIsEditBoardOpen(true);
    };

    const handleDeleteBoard = () => {
        setIsMenuOpen(false);
        setIsDeleteBoardOpen(true);
    };

    const handleSaveBoardTitle = (nextTitle) => {
        onRenameBoard?.(nextTitle);
        setIsEditBoardOpen(false);
    };

    const handleConfirmDeleteBoard = () => {
        onDeleteBoard?.();
        setIsDeleteBoardOpen(false);
    };

    const handleCardContextMenu = (event) => {
        event.preventDefault();
        setIsMenuOpen(true);
    };

    return (
        <>
            <div className={styles.card} onContextMenu={handleCardContextMenu}>
                <div className={styles.header}>
                    <h3>{title.toUpperCase()}</h3>
                    <div className={styles.actions} ref={menuRef}>
                        <button 
                            title="Adicionar Link"
                            onClick={() => {
                                setEditingIndex(null);
                                setIsModalOpen(true);
                            }}
                        >
                            <TbLinkPlus size={20}/>
                        </button>
                        <button
                            title="Opções"
                            onClick={() => setIsMenuOpen((current) => !current)}
                        >
                            <CiMenuKebab size={20}/>
                        </button>

                        {isMenuOpen && (
                            <CardMenu
                                onOpenAllLinks={handleOpenAllLinks}
                                onEditBoard={handleEditBoard}
                                onDeleteBoard={handleDeleteBoard}
                            />
                        )}
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

            <Modal
                isOpen={isEditBoardOpen}
                onClose={() => setIsEditBoardOpen(false)}
                title="Editar card"
            >
                <BoardTitleModal
                    isOpen={isEditBoardOpen}
                    onClose={() => setIsEditBoardOpen(false)}
                    onSave={handleSaveBoardTitle}
                    initialTitle={title}
                />
            </Modal>

            <ConfirmModal
                isOpen={isDeleteBoardOpen}
                onClose={() => setIsDeleteBoardOpen(false)}
                onConfirm={handleConfirmDeleteBoard}
                title="Deletar card"
                description={`Tem certeza que deseja deletar \"${title}\"? Esta ação não pode ser desfeita.`}
                confirmLabel="Deletar"
            />
        </>
    )
}

export default Card