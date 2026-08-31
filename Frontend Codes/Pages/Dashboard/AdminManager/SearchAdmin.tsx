import { type Admin } from '../../../Service/Api.ts';

export function filterAdmins(admins: Admin[], text: string, role: string = ""): Admin[] {
    const query = (text ?? '').trim().toLowerCase();
    const roleFilter = role !== "" ? Number(role) : null;

    return admins.filter((admin: any) => {
        if (roleFilter !== null && admin.order_no !== roleFilter) return false;
        if (!query) return true;

        const email = typeof admin.email === 'string' ? admin.email.toLowerCase() : '';
        const phno = typeof admin.phno === 'string' ? admin.phno.toLowerCase() : '';
        return email.includes(query) || phno.includes(query);
    });
}

export function getRoleOptions(admins: Admin[]): number[] {
    const roles = new Set<number>();
    admins.forEach((admin: any) => {
        if (typeof admin.order_no === 'number') roles.add(admin.order_no);
    });
    return Array.from(roles).sort((a, b) => a - b);
}