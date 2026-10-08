import type { ReactNode } from 'react';

export type Category = string | { name: string; title: string };

export interface Row {
    [key: string]: ReactNode;
}

export type TableStateCause = 'page' | 'pageSize' | 'search';

export interface TableState {
    page: number;
    pageSize: number;
    search: string;
}

export type TableStateInput = { [K in keyof TableState]?: TableState[K] | undefined };
