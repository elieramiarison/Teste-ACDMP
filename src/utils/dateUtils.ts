import { parse } from 'date-fns';

export function isDateExpired(dateStr: string): boolean {
    try {
        const date = parse(dateStr, 'dd/MM/yyyy', new Date());
        return date < new Date();
    } catch {
        return false;
    }
}