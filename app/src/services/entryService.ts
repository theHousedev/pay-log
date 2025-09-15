import type { Entry } from "@/types";
import { getAPIPath } from "@/utils/backend";

const apiPath = getAPIPath();

export const entryService = {
    async createEntry(entry: Entry) {
        const response = await fetch(`${apiPath}/new`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entry)
        });
        return response.json();
    },
    async updateEntry(entry: Entry) {
        const response = await fetch(`${apiPath}/edit`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entry)
        });
        return response.json();
    },
    async deleteEntry(id: number) {
        const response = await fetch(`${apiPath}/delete?id=${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });
        return response.json();
    }
};