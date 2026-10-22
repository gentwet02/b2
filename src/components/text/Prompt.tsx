import type { ReactNode } from 'react';
import PanelEmpty from '@/components/panel/PanelEmpty';

interface PromptProps {
    children: ReactNode;
}

/** Centered hint where results will show: "Pick a player above…". */
export default function Prompt(props: PromptProps) {
    const { children } = props;

    return <PanelEmpty className='prompt'>{children}</PanelEmpty>;
}
