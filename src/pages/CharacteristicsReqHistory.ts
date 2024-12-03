import { CharacteristicOperation } from "@/types/ble_device";

export interface CharacteristicOperationHistory extends CharacteristicOperation {
    timestamp: string;                     
}

export function formatTime(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

export class CharacteristicsReqHistory {
    public history_list: CharacteristicOperationHistory[] = [];

    public add(value: CharacteristicOperationHistory): void {
        this.history_list.push(value);
    }

    public clear(): void {
        this.history_list = [];
    }
}