import NapicuCookies from "../Cookies";


interface IServicesAliasesTable {
    name: string,
    alias: string
}

export default class NapicuServiceAliasManager {
    private static readonly COOKIES_SERVICES_ALIASES_TABLE_NAME: string = "services_aliases";

    public static set_alias(key: string, value: string): void {
        const aliases_table: IServicesAliasesTable[] = NapicuCookies.getCookies<IServicesAliasesTable[]>(NapicuServiceAliasManager.COOKIES_SERVICES_ALIASES_TABLE_NAME) ?? [];

        const updated_aliases_table = aliases_table.some(item => item.name === key) 
            ? aliases_table.map(item => 
                item.name === key ? { ...item, alias: value } : item
            )  
            : [...aliases_table, { name: key, alias: value }];  

        NapicuCookies.setCookies<IServicesAliasesTable[]>(NapicuServiceAliasManager.COOKIES_SERVICES_ALIASES_TABLE_NAME, updated_aliases_table);
    }

    public static get_alias_by_key(key: string): string | null {
        return NapicuCookies.getCookies<IServicesAliasesTable[]>(NapicuServiceAliasManager.COOKIES_SERVICES_ALIASES_TABLE_NAME)?.find((item: IServicesAliasesTable) => {
            return item.name === key;
        })?.alias ?? null;
    }

    public static isAliasDuplicate(alias: string): boolean {
        return NapicuCookies.getCookies<IServicesAliasesTable[]>(NapicuServiceAliasManager.COOKIES_SERVICES_ALIASES_TABLE_NAME)?.some(item => item.alias === alias) ?? false;
    }

    public static get_aliases(): IServicesAliasesTable[] | null {
        return NapicuCookies.getCookies<IServicesAliasesTable[]>(NapicuServiceAliasManager.COOKIES_SERVICES_ALIASES_TABLE_NAME);
    }
}