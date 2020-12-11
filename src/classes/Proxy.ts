import ProxyAnonymousLevel from "../enum/ProxyAnonymousLevel";
import ProxySpeedLevel from "../enum/ProxySpeedLevel";
import ProxyStatus from "../enum/ProxyStatus";
import ProxyVersion from "../enum/ProxyVersion";
import ProxyJudgeResponse from "../models/ProxyJudgeResponse";
import { clock } from '../helpers/performance';
import { AxiosRequestConfig, AxiosStatic } from "axios";
import { proxySplit } from '../helpers/splitter'
import createSocksProxyAgent, { SocksProxyAgent } from 'socks-proxy-agent';

import { generateAxiosHandler, checkRequestResponseIsGood } from '../helpers/request';

class Proxy {

    proxy: string;
    address: string
    port: string

    username: string = ""
    password: string = ""

    proxyJudgeSelected: string = ""
    proxyInformationProviderSelected: string = ""

    anonymousLevel: ProxyAnonymousLevel = ProxyAnonymousLevel.Unknown;
    speedLevel: ProxySpeedLevel = ProxySpeedLevel.Unknown;
    status: ProxyStatus = ProxyStatus.Unknown;
    version: ProxyVersion = ProxyVersion.Unknown;
    timeTaken: number = 0;
    country: string = ""

    axios: AxiosStatic | null = null;
    timeout: number = 0;

    myIP: string = ""

    constructor(proxy: string, axios: AxiosStatic) {
        this.proxy = proxy;
        this.axios = axios;

        const { values, hasAuth } = proxySplit(proxy);
        this.address = values[0];
        this.port = values[1];

        if (hasAuth) {
            this.username = values[2];
            this.password = values[3];
        }
    }

    async checkProxy(proxyJudgeSelected: string, proxyInformationProviderSelected: string, myIP: string, timeout: number = 0) {
        this.proxyJudgeSelected = proxyJudgeSelected;
        this.proxyInformationProviderSelected = proxyInformationProviderSelected;
        this.timeout = timeout;
        this.myIP = myIP;

        var start = clock(null);

        await this.checkWithHttpProxy();

        var end = clock(start);

        if (this.status === ProxyStatus.Dead) {
            var start = clock(null);
            await this.checkWithSockProxy()
        }
        var end = clock(start);

        if (this.status === ProxyStatus.Dead) return;

        if (typeof end === "number") {
            this.timeTaken = end;
            this.handleCalculProxySpeed()
        }

        if (proxyJudgeSelected) {
            const proxyJudgeInformation = await this.getProxyJudgeInformation();
            this.setAnonymousInformation(proxyJudgeInformation, this.myIP);
        }

        if (proxyInformationProviderSelected) {
            const proxyInformation = await this.getProxyInformation();
            if (!proxyInformation) return;

            if (proxyInformation.country) {
                this.country = proxyInformation?.country;
            } else {
                this.country = proxyInformation?.country_name;
            }
        }
    }

    private async checkWithHttpProxy() {
        try {
            const resultWithHttp = await this.generateHttpAxiosHandler("http://check-host.net/ip");
            if (!checkRequestResponseIsGood(resultWithHttp.status)) {
                this.status = ProxyStatus.Dead;
                return;
            }
            this.status = ProxyStatus.Alive;
            this.version = ProxyVersion.HTTP;
        } catch (error) {
            this.status = ProxyStatus.Dead;
        }
    }

    private async checkWithSockProxy() {
        try {
            const resultWithSocks = await this.generateSocksAxiosHandler("http://check-host.net/ip")
            if (!checkRequestResponseIsGood(resultWithSocks.status)) {
                this.status = ProxyStatus.Dead;
                return;
            }
            this.status = ProxyStatus.Alive;
            this.version = ProxyVersion.SOCKS
        } catch (error) {
            this.status = ProxyStatus.Dead;
        }
    }

    private handleCalculProxySpeed() {
        if (this.timeTaken >= 3000) this.speedLevel = ProxySpeedLevel.Slow
        if (this.timeTaken >= 1000) this.speedLevel = ProxySpeedLevel.Medium
        if (this.timeTaken < 1000) this.speedLevel = ProxySpeedLevel.Fast
    }




    private async getProxyJudgeInformation(): Promise<string> {
        const resultProxyJudge =
            this.version === ProxyVersion.HTTP ?
                await this.generateHttpAxiosHandler(this.proxyJudgeSelected)
                : await this.generateSocksAxiosHandler(this.proxyJudgeSelected);

        if (resultProxyJudge.status !== 200) {
            this.status = ProxyStatus.Dead;
            return "";
        }
        return resultProxyJudge.data;
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

    private async getProxyInformation(): Promise<any | null> {
        try {
            const { data, status } =
                this.version === ProxyVersion.HTTP ?
                    await this.generateHttpAxiosHandler(this.proxyJudgeSelected)
                    : await this.generateSocksAxiosHandler(this.proxyJudgeSelected);

            if (status == 200) {
                let b = null
                try {
                    b = JSON.parse(data);
                } catch (error) {
                    b = data
                }
                return b;
            }
        } catch (error) {
        }

        return null;
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

    private async generateHttpAxiosHandler(url: string) {
        if (!this.axios) throw new Error("No axios instance added")

        const option: AxiosRequestConfig = {
            proxy: {
                host: this.address,
                port: parseInt(this.port),
            }
        }

        if (this.username && this.password && option.proxy) {
            option.proxy.auth = {
                username: this.username,
                password: this.password
            }
        }

        return generateAxiosHandler(this.axios, this.timeout, null, option).get(url)
    }

    private async generateSocksAxiosHandler(url: string) {
        if (!this.axios) throw new Error("No axios instance added")

        const option: createSocksProxyAgent.SocksProxyAgentOptions = {
            host: `socks://${this.address}:${this.port}`,
            timeout: this.timeout,
        };

        if (this.username && this.password) {
            option.userId = this.username;
            option.password = this.password;
        }
        const agent = new SocksProxyAgent(option);

        return generateAxiosHandler(this.axios, this.timeout, agent, null).get(url)
    }
}

export default Proxy;