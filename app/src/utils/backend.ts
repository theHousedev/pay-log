export const getBackendPath = (): string => {
    const isProduction = window.location.hostname === 'pay.khouse.dev';
    const isMobile = /iPhone|iPad/i.test(navigator.userAgent);

    if (isProduction) {
        return window.location.origin + '/api';
    } else {
        const backendPort = (globalThis as any).BACKEND_PORT;
        const backendHost = isMobile ? '10.0.0.8' : 'localhost';
        return `http://${backendHost}:${backendPort}/api`;
    }
};