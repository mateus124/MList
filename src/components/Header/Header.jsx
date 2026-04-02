import { useEffect, useRef, useState } from "react";
import { TiPlus } from "react-icons/ti";
import styles from './Header.module.css'

const Header = () => {
    const navRef = useRef(null);
    const [canScroll, setCanScroll] = useState(false);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

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

    const scrollTabs = (direction) => {
        const nav = navRef.current;
        if (!nav) return;

        const step = Math.max(nav.clientWidth * 0.6, 140);
        nav.scrollBy({
            left: direction === 'left' ? -step : step,
            behavior: 'smooth',
        });
    };

    return (
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
                    <button className={styles.button}>HomePage</button>
                    <button className={styles.button}>AlterPage</button>
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

            <button className={styles.buttonadd} title="Adicionar abas"><TiPlus size={20}/></button>
        </div>
    )
}

export default Header