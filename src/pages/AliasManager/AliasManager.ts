import NapicuCookies from "../Cookies";


interface IServicesAliasesTable {
    name: string,
    alias: string
}

export default class NapicuAliasManager {



    constructor(private table_name: string) {}

    public set_alias(key: string, value: string): void {
        const aliases_table: IServicesAliasesTable[] = NapicuCookies.getCookies<IServicesAliasesTable[]>(this.table_name) ?? [];

        const updated_aliases_table = aliases_table.some(item => item.name === key) 
            ? aliases_table.map(item => 
                item.name === key ? { ...item, alias: value } : item
            )  
            : [...aliases_table, { name: key, alias: value }];  

        NapicuCookies.setCookies<IServicesAliasesTable[]>(this.table_name, updated_aliases_table);
    }

    public get_alias_by_key(key: string): string | null {
        return NapicuCookies.getCookies<IServicesAliasesTable[]>(this.table_name)?.find((item: IServicesAliasesTable) => {
            return item.name === key;
        })?.alias ?? null;
    }

    public is_alias_duplicate(alias: string): boolean {
        return NapicuCookies.getCookies<IServicesAliasesTable[]>(this.table_name)?.some(item => item.alias.toLowerCase() === alias.toLowerCase()) ?? false;
    }

    public get_aliases(): IServicesAliasesTable[] | null {
        return NapicuCookies.getCookies<IServicesAliasesTable[]>(this.table_name);
    }
}