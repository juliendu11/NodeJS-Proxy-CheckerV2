import Proxy from "./classes/Proxy"
import Result from "./models/Result";
import fs from 'fs';
import axios from 'axios'

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

        if (this.proxyJudgesList.length ===0) throw new Error("No proxy judge added");

        if (this.proxyInformationProvider.length ===0) throw new Error("No proxy information provider added");

        if (this.proxiesList.length === 0) throw new Error("No proxies added");

        if (!this.myIP) await this.getMyIP();

        result = await Promise.all(this.proxiesList.map(async (proxy) => {
           await proxy.checkProxy(this.getRandomProxyJudge(),this.getRandomProxyInformationProvider(), this.myIP, this.timeout);

           var r = new Result(proxy.anonymousLevel, proxy.speedLevel, proxy.status, proxy.version, proxy.proxy, proxy.proxyJudgeSelected, proxy.timeTaken, proxy.proxyInformationProviderSelected, proxy.country);

           if (callback) callback(r);
           return r;
        }));

        return result;
    }

    private getRandomProxyJudge():string {
        return this.getRandomInArray(this.proxyJudgesList);
    }

    private getRandomProxyInformationProvider():string {
        return this.getRandomInArray(this.proxyInformationProvider);
    }

    private getRandomInArray(arrayTarget:string[]):string {
        return arrayTarget[Math.floor(Math.random() * arrayTarget.length)];
    }

    private async getMyIP() {
        try {
          const {data} = await axios({
            method: 'get',
            url: 'http://checkip.dyndns.org/',
          });
          var r = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/;
          this.myIP = data.match(r)[0];
          return this.myIP;
        } catch (error) {
          throw error
        }
      }
}

export default ProxyChecker