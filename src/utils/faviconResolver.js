const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const IMAGE_LOAD_TIMEOUT_MS = 1500;

const faviconCache = new Map();

const DOMAIN_OVERRIDES = {
    'si3.ufc.br': ['https://si3.ufc.br/shared/img/brasao.ico'],
};

const buildCandidates = (hostname) => {
    const encodedHostname = encodeURIComponent(hostname);
    const encodedDomain = encodeURIComponent(`https://${hostname}`);

    const defaults = [
        `https://www.google.com/s2/favicons?domain=${encodedHostname}&sz=32`,
        `https://icons.duckduckgo.com/ip3/${hostname}.ico`,
        `https://${hostname}/favicon.ico`,
    ];

    const custom = DOMAIN_OVERRIDES[hostname] ?? [];
    return [...custom, ...defaults, `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&url=${encodedDomain}&size=32`];
};

const canLoadImage = (url) => {
    return new Promise((resolve) => {
        const image = new Image();
        const timeoutId = window.setTimeout(() => {
            image.src = '';
            resolve(false);
        }, IMAGE_LOAD_TIMEOUT_MS);

        image.onload = () => {
            window.clearTimeout(timeoutId);
            resolve(true);
        };

        image.onerror = () => {
            window.clearTimeout(timeoutId);
            resolve(false);
        };

        image.src = url;
    });
};

const getCacheEntry = (hostname) => {
    const entry = faviconCache.get(hostname);
    if (!entry) {
        return null;
    }

    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
        faviconCache.delete(hostname);
        return null;
    }

    return entry;
};

export const resolveFaviconUrl = async (rawUrl) => {
    try {
        const hostname = new URL(rawUrl).hostname;

        const cached = getCacheEntry(hostname);
        if (cached) {
            return cached.url;
        }

        const candidates = buildCandidates(hostname);
        for (const candidate of candidates) {
            const isValid = await canLoadImage(candidate);
            if (isValid) {
                faviconCache.set(hostname, {
                    url: candidate,
                    timestamp: Date.now(),
                });
                return candidate;
            }
        }

        faviconCache.set(hostname, {
            url: null,
            timestamp: Date.now(),
        });
        return null;
    } catch {
        return null;
    }
};