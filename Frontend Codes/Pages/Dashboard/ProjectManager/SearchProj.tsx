import { Search_Info, type OnlyProj } from '../../../Service/Api';
import { toast } from 'react-toastify';

export async function InputSearch(resp: Record<string, string>): Promise<OnlyProj[] | null> {
    const data : Record<string,string> = {
        "name": resp.text,
        "is_active": resp.active,
        "priority": resp.priority
    };

    try {
        const response = await Search_Info(data);
        const payload = response?.data ?? response ?? null;
        
        if (Array.isArray(payload)) return payload;
        
        if (payload && Array.isArray(payload.projects)) return payload.projects;

        return [];
    } catch {
        toast.error('Unable to search projects.');
        return null;
    }
}