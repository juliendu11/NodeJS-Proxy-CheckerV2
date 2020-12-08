import ProxyAnonymousLevel from "../enum/ProxyAnonymousLevel";
import ProxySpeedLevel from "../enum/ProxySpeedLevel";
import ProxyStatus from "../enum/ProxyStatus";
import ProxyVersion from "../enum/ProxyVersion";
import ProxyJudgeResponse from "../models/ProxyJudgeResponse";
import { clock } from '../helpers/performance';
import { AxiosRequestConfig, AxiosStatic } from "axios";
import {proxySplit } from '../helpers/splitter'
import { throws } from "assert";

class Proxy {

    proxy: string;
    address: string
    port: string

    username:string =""
    password:string =""

    proxyJudgeSelected: string = ""
    proxyInformationProviderSelected: string = ""

    anonymousLevel: ProxyAnonymousLevel = ProxyAnonymousLevel.Unknown;
    speedLevel: ProxySpeedLevel = ProxySpeedLevel.Unknown;
    status: ProxyStatus = ProxyStatus.Unknown;
    version: ProxyVersion = ProxyVersion.Unknown;
    timeTaken: number = 0;
    country: string = ""

    axios: AxiosStatic | null = null;
    timeout:number = 0;

    constructor(proxy: string, axios: AxiosStatic) {
        this.proxy = proxy;
        this.axios = axios;

        const val = proxySplit(proxy);
        this.address = val[0];
        this.port = val[1];

        if(val.length > 2){
            this.username = val[2];
            this.password = val[3];
        }
    }

    async checkProxy(proxyJudgeSelected: string, proxyInformationProviderSelected: string, myIP: string, timeout:number =0) {
        this.proxyJudgeSelected = proxyJudgeSelected;
        this.proxyInformationProviderSelected = proxyInformationProviderSelected;
        this.timeout = timeout;

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
                this.anonymousLevel = ProxyAnonymousLevel.Unknown;
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

        let option: AxiosRequestConfig = {
            timeout: this.timeout,
            proxy: {
                host: this.address,
                port: parseInt(this.port),
            },
        }

        if (this.username && this.password) {
            option = {
                timeout: this.timeout,
                proxy: {
                    host: this.address,
                    port: parseInt(this.port),
                    auth: {
                        username: this.username,
                        password: this.password
                    }
                },
            }
        }
        
        return await this.axios.get(url, option)
    }
}

export default Proxy;