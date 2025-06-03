type Feed = {

    fed_at: number;
    amount?: number; // in oz
    duration?: number; // in minutes
    method: string; // e.g., "bottle", "nursing"
};

type Diaper = {
    changed_at: number;
    type: string; // e.g., "wet", "dirty"
    size: string;
};

export function getTodaysDemoData(): { feeds: Feed[]; diapers: Diaper[] } {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const day = now.getDate();

    const feeds: Feed[] = [
        { fed_at: new Date(year, month, day, 17, 0, 0).getTime() / 1000, duration: 12, method: 'nursing' },
        { fed_at: new Date(year, month, day, 14, 0, 0).getTime() / 1000, amount: 5, method: 'bottle' },
        { fed_at: new Date(year, month, day, 11, 0, 0).getTime() / 1000, duration: 15, method: 'nursing' },
        { fed_at: new Date(year, month, day, 8, 0, 0).getTime() / 1000, amount: 6, method: 'bottle' },
    ];

    const diapers: Diaper[] = [
        { changed_at: new Date(year, month, day, 18, 45, 0).getTime() / 1000, type: 'soiled', size: 'medium' },
        { changed_at: new Date(year, month, day, 15, 0, 0).getTime() / 1000, type: 'mixed', size: 'medium' },
        { changed_at: new Date(year, month, day, 11, 30, 0).getTime() / 1000, type: 'dry', size: 'light' },
        { changed_at: new Date(year, month, day, 9, 0, 0).getTime() / 1000, type: 'wet', size: 'heavy' },
    ];

    return { feeds, diapers };
}

export function getDemoCalendarData(): { feeds: any[]; diapers: any[] } {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const feeds: any[] = [];
    const diapers: any[] = [];

    let feedId = 1;
    let diaperId = 1;
    for (let day = 1; day <= 28; day++) {
        const feedEvents = [
            { method: 'bottle', amount: 5, fed_at: new Date(year, month, day, 8, 0, 0).getTime() / 1000 },
            { method: 'nursing', duration: 10, fed_at: new Date(year, month, day, 12, 0, 0).getTime() / 1000 },
            { method: 'bottle', amount: 4, fed_at: new Date(year, month, day, 16, 0, 0).getTime() / 1000 }
        ];

        for (const f of feedEvents) {
            let title =
                f.method === "bottle"
                    ? `${f.method} feed, ${f.amount} oz`
                    : `${f.method}, ${f.duration} mins`;
            feeds.push({
                title,
                id: `feed-${feedId++}`,
                start: f.fed_at * 1000,
                end: f.fed_at * 1000 + 30 * 60 * 1000,
                backgroundColor: "#66bdb8",
            });
        }

        const diaperEvents = [
            { type: 'wet', size: 'medium', changed_at: new Date(year, month, day, 9, 30, 0).getTime() / 1000 },
            { type: 'soiled', size: 'heavy', changed_at: new Date(year, month, day, 14, 30, 0).getTime() / 1000 }
        ];

        for (const d of diaperEvents) {
            diapers.push({
                id: `diaper-${diaperId++}`,
                title: `${d.type} diaper`,
                size: d.size,
                start: d.changed_at * 1000,
                end: d.changed_at * 1000 + 30 * 60 * 1000,
            });
        }
    }

    return { feeds, diapers };
}