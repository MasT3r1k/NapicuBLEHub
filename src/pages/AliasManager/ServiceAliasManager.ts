import NapicuCookies from "../Cookies";


interface IServicesAliasesTable {
    name: string,
    alias: string
}

export default class NapicuServiceAliasManager {
    private static  creat_table(): void {
        NapicuCookies.setCookies<IServicesAliasesTable[]>("services_aliases", []);
    }

    public static set_alias(key: string, value: string): void {
        const aliases_table: IServicesAliasesTable[] = NapicuCookies.getCookies<IServicesAliasesTable[]>("services_aliases") ?? [];
        
        const updated_aliases_table = aliases_table.some(item => item.name === key) 
            ? aliases_table.map(item => 
                item.name === key ? { ...item, alias: value } : item
            )  
            : [...aliases_table, { name: key, alias: value }];  

        NapicuCookies.setCookies<IServicesAliasesTable[]>("services_aliases", updated_aliases_table);
    }

    public static get_alias_by_key(key: string): string | null {
        return NapicuCookies.getCookies<IServicesAliasesTable[]>("services_aliases")?.find((item: IServicesAliasesTable) => {
            return item.name === key;
        })?.alias ?? null;
    }

    public static isAliasDuplicate(alias: string): boolean {
        return NapicuCookies.getCookies<IServicesAliasesTable[]>("services_aliases")?.some(item => item.alias === alias) ?? false;
    }

    public static get_aliases(): IServicesAliasesTable[] | null {
        return NapicuCookies.getCookies<IServicesAliasesTable[]>("services_aliases");
    }


}