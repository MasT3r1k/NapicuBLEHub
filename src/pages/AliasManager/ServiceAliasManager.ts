import NapicuCookies from "../Cookies";


interface IServicesAliasesTable {
    name: string,
    alias: string
}

export default class NapicuServiceAliasManager {
    private creat_table(): void {
        NapicuCookies.setCookies<IServicesAliasesTable[]>("services_aliases", []);
    }

    public set_alias(key: string, value: string): void {
        const aliases_table: IServicesAliasesTable[] = NapicuCookies.getCookies<IServicesAliasesTable[]>("services_aliases") ?? [];
        if(!aliases_table) this.creat_table();
        NapicuCookies.setCookies<IServicesAliasesTable[]>("services_aliases", [...aliases_table, {name: key, alias: value}]);
    }

    public get_alias_by_key(key: string): string | null {
        return NapicuCookies.getCookies<IServicesAliasesTable[]>("services_aliases")?.find((item: IServicesAliasesTable) => {
            return item.name === key;
        })?.alias ?? null;
    }

    public get_aliases(): IServicesAliasesTable[] | null {
        return NapicuCookies.getCookies<IServicesAliasesTable[]>("services_aliases");
    }
}