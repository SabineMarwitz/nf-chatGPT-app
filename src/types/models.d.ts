export interface ChatEntry{
    id?: number;
    question: string;
    answer: string;
    createdAt: string;
}

export type ChatEntries = ChatEntry[];