import { isValidElement, type ReactNode } from 'react';
import type { Category } from '@/types/table';

/** Visible text of a cell, so search also matches cells holding links or badges. */
export function nodeText(node: ReactNode): string {
    if (node === null || node === undefined || typeof node === 'boolean') return '';
    if (typeof node === 'string' || typeof node === 'number') return String(node);
    if (Array.isArray(node)) return node.map(nodeText).join(' ');
    if (isValidElement<{ children?: ReactNode }>(node)) return nodeText(node.props.children);
    return '';
}

/** A cell's value to sort on: a number when the text is one ("1,234"), else lowercase text. */
export function sortValue(node: ReactNode): string | number {
    if (typeof node === 'number') return node;
    const text = nodeText(node);
    const asNumber = Number(text.replace(/[\s,]/g, ''));
    return text !== '' && Number.isFinite(asNumber) ? asNumber : text.toLowerCase();
}

export const categoryKey = (category: Category) =>
    typeof category === 'string' ? category : category.name;
