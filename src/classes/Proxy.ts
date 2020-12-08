import ProxyAnonymousLevel from "../enum/ProxyAnonymousLevel";
import ProxySpeedLevel from "../enum/ProxySpeedLevel";
import ProxyStatus from "../enum/ProxyStatus";
import ProxyVersion from "../enum/ProxyVersion";
import ProxyJudgeResponse from "../models/ProxyJudgeResponse";
import { clock } from '../helpers/performance';
import { AxiosStatic } from "axios";

class Proxy {

    proxy: string;
    address: string
    port: string

    proxyJudgeSelected: string = ""
    proxyInformationProviderSelected: string = ""

    anonymousLevel: ProxyAnonymousLevel = ProxyAnonymousLevel.Unknwow;
    speedLevel: ProxySpeedLevel = ProxySpeedLevel.Unknwow;
    status: ProxyStatus = ProxyStatus.Unknwow;
    version: ProxyVersion = ProxyVersion.Unknwow;
    timeTaken: number = 0;
    country: string = ""

    axios: AxiosStatic | null = null;

    constructor(proxy: string, axios: AxiosStatic) {
        this.proxy = proxy;
        this.axios = axios;

        this.address = proxy.split(':')[0];
        this.port = proxy.split(':')[1];
    }

    async checkProxy(proxyJudgeSelected: string, proxyInformationProviderSelected: string, myIP: string) {
        this.proxyJudgeSelected = proxyJudgeSelected;
        this.proxyInformationProviderSelected = proxyInformationProviderSelected;

        let data;

        try {
            var start = clock(null);
            const result = await this.generateAxiosHandler(proxyJudgeSelected)
            var end = clock(start);

            if (typeof end === "number")
                this.timeTaken = end;

            if (result.status !== 200) {
                this.status = ProxyStatus.Dead;
                return;
            }

            this.status = ProxyStatus.Alive;
            data = result.data;
        } catch (error) {
            this.status = ProxyStatus.Dead;
        }

        if (this.status === ProxyStatus.Dead) return;

        this.setAnonymousInformation(data, myIP);
        await this.getProxyInformation();
    }


    private setAnonymousInformation(data: any, myIP: string) {
        var obj = this.parseProxyJudgeInformation(data);
        if (obj["REMOTE_ADDR"]) {
            if (obj["REMOTE_ADDR"].includes(this.address)) {
                this.anonymousLevel = ProxyAnonymousLevel.Medium;
            } else if (obj["REMOTE_ADDR"].includes(myIP)) {
                this.anonymousLevel = ProxyAnonymousLevel.Low;
            } else {
                this.anonymousLevel = ProxyAnonymousLevel.Unknwow;
            }
        } else {
            this.anonymousLevel = ProxyAnonymousLevel.Hight;
        }
    }

    private async getProxyInformation() {
        try {
            const { data, status } = await this.generateAxiosHandler(this.proxyInformationProviderSelected)
            if (status == 200) {
                let b = null
                try {
                    b = JSON.parse(data);
                } catch (error) {
                    b = data
                }

                if (b.country) {
                    this.country = b.country;
                } else {
                    this.country = b.country_name;
                }
            }
        } catch (error) {

        }
    }

    /**
 * Parse data of proxy judege to object with key:value
 * @param {string} content proxy judge response
 * @returns {object}
 */
    private parseProxyJudgeInformation(content: string): ProxyJudgeResponse {
        var values: ProxyJudgeResponse = {};

        var lines = content.split("\n");
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i].split("=");
            try {
                values[line[0].trim()] = line[1].trim();
            } catch (error) { }
        }
        return values;
    }

    private async generateAxiosHandler(url: string) {
        if (!this.axios) throw new Error("No axios instance added")
        return await this.axios.get(url, {
            proxy: {
                host: this.address,
                port: parseInt(this.port),
            },
        })
    }
}

export default Proxy;