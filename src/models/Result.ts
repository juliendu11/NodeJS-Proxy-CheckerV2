import ProxyAnonymousLevel from '../enum/ProxyAnonymousLevel';
import ProxySpeedLevel from '../enum/ProxySpeedLevel';
import ProxyStatus from '../enum/ProxyStatus';
import ProxyVersion from '../enum/ProxyVersion';

class Result {

    ProxyAnonymousLevel: ProxyAnonymousLevel = ProxyAnonymousLevel.Unknown;
    ProxySpeedLevel: ProxySpeedLevel = ProxySpeedLevel.Unknown;
    ProxyStatus: ProxyStatus = ProxyStatus.Unknown;
    ProxyVersion: ProxyVersion = ProxyVersion.Unknown;
    Proxy:string
    ProxyJudgeSelected:string
    ProxyInformationProviderSelected:string
    TimeTaken:number
    Country:string

    constructor(proxyAnonymousLevel: ProxyAnonymousLevel,
        proxySpeedLebel: ProxySpeedLevel,
        proxyStatus: ProxyStatus,
        proxyVersion: ProxyVersion,
        proxy:string,
        proxyJudgeSelected:string,
        timeTaken:number,
        proxyInformationProviderSelected:string,
        country:string) {
        this.ProxyAnonymousLevel = proxyAnonymousLevel;
        this.ProxySpeedLevel = proxySpeedLebel;
        this.ProxyStatus = proxyStatus;
        this.ProxyVersion = proxyVersion;
        this.Proxy = proxy;
        this.ProxyJudgeSelected = proxyJudgeSelected;
        this.TimeTaken = timeTaken;
        this.ProxyInformationProviderSelected = proxyInformationProviderSelected;
        this.Country = country;
    }
}

export default Result