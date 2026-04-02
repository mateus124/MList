import { useEffect, useRef, useState } from "react";
import { TiPlus } from "react-icons/ti";
import { FiEdit3 } from "react-icons/fi";
import { MdOutlineDeleteOutline } from "react-icons/md";
import Modal from '../Modal/Modal';
import BoardTitleModal from '../BoardTitleModal/BoardTitleModal';
import ConfirmModal from '../ConfirmModal/ConfirmModal';
import styles from './Header.module.css'

const Header = ({ tabs = [], activeTabId, onSelectTab, onAddTab, onRenameTab, onDeleteTab }) => {
    const navRef = useRef(null);
    const contextMenuRef = useRef(null);
    const [canScroll, setCanScroll] = useState(false);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const [isAddTabModalOpen, setIsAddTabModalOpen] = useState(false);
    const [isRenameTabModalOpen, setIsRenameTabModalOpen] = useState(false);
    const [isDeleteTabModalOpen, setIsDeleteTabModalOpen] = useState(false);
    const [contextMenu, setContextMenu] = useState({
        isOpen: false,
        x: 0,
        y: 0,
        tabId: null,
        tabTitle: '',
    });

    const updateScrollState = () => {
        const nav = navRef.current;
        if (!nav) return;

        const hasOverflow = nav.scrollWidth > nav.clientWidth + 1;
        setCanScroll(hasOverflow);
        setCanScrollLeft(nav.scrollLeft > 1);
        setCanScrollRight(nav.scrollLeft + nav.clientWidth < nav.scrollWidth - 1);
    };

    useEffect(() => {
        const nav = navRef.current;
        if (!nav) return;

        updateScrollState();
        const rafId = requestAnimationFrame(updateScrollState);

        const resizeObserver = new ResizeObserver(() => {
            updateScrollState();
        });

        const mutationObserver = new MutationObserver(() => {
            updateScrollState();
        });

        resizeObserver.observe(nav);
        mutationObserver.observe(nav, { childList: true, subtree: true, characterData: true });
        window.addEventListener('resize', updateScrollState);

        return () => {
            cancelAnimationFrame(rafId);
            resizeObserver.disconnect();
            mutationObserver.disconnect();
            window.removeEventListener('resize', updateScrollState);
        };
    }, []);

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
                setContextMenu((current) => ({ ...current, isOpen: false }));
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, []);

    const scrollTabs = (direction) => {
        const nav = navRef.current;
        if (!nav) return;

        const step = Math.max(nav.clientWidth * 0.6, 140);
        nav.scrollBy({
            left: direction === 'left' ? -step : step,
            behavior: 'smooth',
        });
    };

    const handleCreateTab = (title) => {
        onAddTab?.(title);
        setIsAddTabModalOpen(false);
    };

    const handleOpenTabMenu = (event, tab) => {
        event.preventDefault();
        setContextMenu({
            isOpen: true,
            x: event.clientX,
            y: event.clientY,
            tabId: tab.id,
            tabTitle: tab.title,
        });
    };

    const handleAskDeleteTab = () => {
        setIsDeleteTabModalOpen(true);
        setContextMenu((current) => ({ ...current, isOpen: false }));
    };

    const handleAskRenameTab = () => {
        setIsRenameTabModalOpen(true);
        setContextMenu((current) => ({ ...current, isOpen: false }));
    };

    const handleConfirmRenameTab = async (nextTitle) => {
        if (!contextMenu.tabId) return;

        await onRenameTab?.(contextMenu.tabId, nextTitle);
        setIsRenameTabModalOpen(false);
        setContextMenu({ isOpen: false, x: 0, y: 0, tabId: null, tabTitle: '' });
    };

    const handleConfirmDeleteTab = async () => {
        if (!contextMenu.tabId) return;

        await onDeleteTab?.(contextMenu.tabId);
        setIsDeleteTabModalOpen(false);
        setContextMenu({ isOpen: false, x: 0, y: 0, tabId: null, tabTitle: '' });
    };

    return (
        <>
            <div className={styles.header}>
                <div className={styles.tabsArea}>
                    {canScroll && (
                        <button
                            className={styles.navControl}
                            onClick={() => scrollTabs('left')}
                            disabled={!canScrollLeft}
                            aria-label="Voltar abas"
                        >
                            {'<'}
                        </button>
                    )}

                    <nav ref={navRef} className={styles.nav} onScroll={updateScrollState}>
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                className={`${styles.button} ${activeTabId === tab.id ? styles.buttonActive : styles.buttonInactive}`}
                                onClick={() => onSelectTab?.(tab.id)}
                                onContextMenu={(event) => handleOpenTabMenu(event, tab)}
                                title={tab.title}
                            >
                                {tab.title}
                            </button>
                        ))}
                    </nav>

                    {canScroll && (
                        <button
                            className={styles.navControl}
                            onClick={() => scrollTabs('right')}
                            disabled={!canScrollRight}
                            aria-label="Avancar abas"
                        >
                            {'>'}
                        </button>
                    )}
                </div>

                <button
                    className={styles.buttonadd}
                    title="Adicionar abas"
                    onClick={() => setIsAddTabModalOpen(true)}
                >
                    <TiPlus size={20}/>
                </button>
            </div>

            {contextMenu.isOpen && (
                <div
                    ref={contextMenuRef}
                    className={styles.contextMenu}
                    style={{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }}
                >
                    <button
                        type="button"
                        className={styles.contextMenuItem}
                        onClick={handleAskRenameTab}
                    >
                        <FiEdit3 size={16} />
                        <span>Editar aba</span>
                    </button>

                    <button
                        type="button"
                        className={`${styles.contextMenuItem} ${styles.contextMenuItemDanger}`}
                        onClick={handleAskDeleteTab}
                        disabled={tabs.length <= 1}
                    >
                        <MdOutlineDeleteOutline size={16} />
                        <span>Deletar aba</span>
                    </button>
                </div>
            )}

            <Modal
                isOpen={isAddTabModalOpen}
                onClose={() => setIsAddTabModalOpen(false)}
                title="Adicionar aba"
            >
                <BoardTitleModal
                    isOpen={isAddTabModalOpen}
                    onClose={() => setIsAddTabModalOpen(false)}
                    onSave={handleCreateTab}
                    initialTitle=""
                    placeholder="Digite o título da aba..."
                    requiredMessage="Nome da aba é obrigatório"
                    submitLabel="Adicionar"
                />
            </Modal>

            <Modal
                isOpen={isRenameTabModalOpen}
                onClose={() => setIsRenameTabModalOpen(false)}
                title="Editar aba"
            >
                <BoardTitleModal
                    isOpen={isRenameTabModalOpen}
                    onClose={() => setIsRenameTabModalOpen(false)}
                    onSave={handleConfirmRenameTab}
                    initialTitle={contextMenu.tabTitle}
                    placeholder="Digite o título da aba..."
                    requiredMessage="Nome da aba é obrigatório"
                    submitLabel="Atualizar"
                />
            </Modal>

            <ConfirmModal
                isOpen={isDeleteTabModalOpen}
                onClose={() => setIsDeleteTabModalOpen(false)}
                onConfirm={handleConfirmDeleteTab}
                title="Deletar aba"
                description={`Tem certeza que deseja deletar a aba \"${contextMenu.tabTitle}\"?`}
                confirmLabel="Deletar"
            />
        </>
    )
}

export default Header