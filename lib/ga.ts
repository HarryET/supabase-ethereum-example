// log specific events happening.
export const event = (action: string, params: Record<string, any>) => {
    // @ts-ignore
    window.gtag("event", action, params);
};
