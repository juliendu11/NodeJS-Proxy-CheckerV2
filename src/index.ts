import Proxy from "./classes/Proxy"
import Result from "./models/Result";
import fs from 'fs';
import ResultCheckLinks from "./models/ResultCheckLinks";
import LinkType from "./enum/LinkType";
import axios from 'axios'
import {generateAxiosHandler, checkRequestResponseIsGood} from './helpers/request';
import { proxySplit } from './helpers/splitter'


class ProxyChecker {

    proxiesList: Proxy[] = [];
    proxyJudgesList: string[] = [];
    proxyInformationProvider: string[] = [];

    defaultProxyJudge = [
        'http://www.knowops.com/cgi-bin/textenv.pl',
        'http://birdingonthe.net/cgi-bin/env.pl'
    ];
    defaultProxyInformationProvider = [
        'http://ip-api.com/json/',
        'http://geolocation-db.com/json/'
    ]

    availableProxyJudgesList: string[] = [];
    availableProxyInformationProvider: string[] = [];

    myIP:string= "";

    timeout =0;

    public addProxiesFromFile(path:string) {
        const values = fs.readFileSync(path,'utf8')
            .toString()
            .match(/[^\r\n]+/g)

        if (!values){
            throw new Error('No proxies found')
        }
        this.addProxiesFromArray(values);
        return this;
    }

    public addProxiesFromArray(proxies:string[]) {
        proxies.forEach(proxy => this.addProxyInList(proxy));
        return this;
    }

    public addOnly1Proxy(proxy:string) {
        const {goodFormat} = proxySplit(proxy);

        if (!goodFormat) throw new Error('The proxy format is bad it should look like this: address:port or address:port:username:password')
        
        this.addProxyInList(proxy);
        return this;
    }

    public addProxyJudge(links:string[]){
        this.proxyJudgesList = [...this.proxyJudgesList, ...links];
        return this;
    }

    public addDefaultProxyJudge() {
        this.proxyJudgesList = [...this.proxyJudgesList, ...this.defaultProxyJudge];
        return this;
    }

    public addProxyInformationProvider(links:string[]){
        this.proxyInformationProvider = [...this.proxyInformationProvider, ...links];
        return this;
    }

    public addDefaultProxyInformationProvider() {
        this.proxyInformationProvider = [...this.proxyInformationProvider, ...this.defaultProxyInformationProvider];
        return this;
    }

    /**
     * 
     * @param msTimeout Number of millisecond
     */
    public setRequestTimeout(msTimeout:number) {
        this.timeout = msTimeout;
        return this;
    }


    private addProxyInList(proxy:string) {
        this.proxiesList.push(new Proxy(proxy, axios))
        return this;
    }


    /**
     * 
     * @param callback Allows to get the return for EACH proxy if you want to get the direct result for each proxy instead of waiting for the end of the function
     */
    public async check(callback: Function|null): Promise<Result[]> {
        let result: Result[] = []

        if (this.proxiesList.length === 0) throw new Error("No proxies added");

        await this.checkProxyJudgeAndInformationProviderLinks();

        if (!this.myIP) await this.getMyIP();

        result = await Promise.all(this.proxiesList.map(async (proxy) => {
           await proxy.checkProxy(this.getRandomProxyJudge(),this.getRandomProxyInformationProvider(), this.myIP, this.timeout);

           var r = new Result(proxy.anonymousLevel, proxy.speedLevel, proxy.status, proxy.version, proxy.proxy, proxy.proxyJudgeSelected, proxy.timeTaken, proxy.proxyInformationProviderSelected, proxy.country);

           if (callback) callback(r);
           return r;
        }));

        return result;
    }

    private async checkProxyJudgeAndInformationProviderLinks() {
        const resultCheckProxyJudgeLinks = await this.checkProxyJudgeLinks(null);
        const resultCheckProxyInformationProviderLinks = await this.checkProxyInformationProviderLinks(null);

        resultCheckProxyJudgeLinks.forEach(x => {
            if (x.Result)
                this.availableProxyJudgesList.push(x.Link);
        });

        resultCheckProxyInformationProviderLinks.forEach(x => {
            if (x.Result)
                this.availableProxyInformationProvider.push(x.Link);
        });
    }

    private getRandomProxyJudge():string {
        return this.getRandomInArray(this.availableProxyJudgesList);
    }

    private getRandomProxyInformationProvider():string {
        return this.getRandomInArray(this.availableProxyInformationProvider);
    }

    private getRandomInArray(arrayTarget:string[]):string {
        return arrayTarget[Math.floor(Math.random() * arrayTarget.length)];
    }

    private async getMyIP() {
        try {
          const {data} = await generateAxiosHandler(axios, this.timeout)
            .get('http://checkip.dyndns.org/');

          var r = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/;
          this.myIP = data.match(r)[0];
          return this.myIP;
        } catch (error) {
          throw error
        }
    }

    public async checkProxyJudgeLinks(callback: Function|null) :Promise<ResultCheckLinks[]> {
        let result: ResultCheckLinks[] = []

        if (this.proxyJudgesList.length ===0) return result;

        result = await Promise.all(this.proxyJudgesList.map(async (link) => {
            const linkResult = await this.checkLink(LinkType.ProxyJudge, link);
            if (callback) callback(linkResult);
            return linkResult;
        }))

        return result;
    }

    public async checkProxyInformationProviderLinks(callback: Function|null) :Promise<ResultCheckLinks[]> {
        let result: ResultCheckLinks[] = []

        if (this.proxyInformationProvider.length ===0) return result;


        result = await Promise.all(this.proxyInformationProvider.map(async (link) => {
            const linkResult = await this.checkLink(LinkType.ProxyInformationProvider, link);
            if (callback) callback(linkResult);
            return linkResult;
        }))

        return result;
    }

    private async checkLink(linkType: LinkType, url:string) :Promise<ResultCheckLinks> {
        try {
            const {status, data} = await generateAxiosHandler(axios, this.timeout).get(url);
            if (!checkRequestResponseIsGood(status) || !data){
                let msg = !checkRequestResponseIsGood(status) ? `Response code is ${status}` : 'No data received in response';

                return new ResultCheckLinks(linkType, false, msg, url)
            }

            return new ResultCheckLinks(linkType, true, "", url)
        } catch (error) {
            return new ResultCheckLinks(linkType, false, `Exception - ${error.message}`, url)
        }
    }
}

export default ProxyChecker