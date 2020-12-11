# NodeJS-Proxy-CheckerV2

It's simple Proxy Checker, get proxy status, anonymous level, type, time, country build with Typescript

- [x] Proxy anonymous level
- [x] Proxy country
- [x] Proxy type (HTTP or SOCKS)
- [x] Proxy time

## Install

```bash
npm i nodejs-proxy-checkerv2
```

## How to use ?

```javascript
const ProxyChecker = require("nodejs-proxy-checkerv2").default;
const instance =new ProxyChecker()
    .addProxiesFromFile("./proxies.txt")
    .addDefaultProxyJudge() // -> optional if you put yours otherwise you have to put it
    .addDefaultProxyInformationProvider(); // -> optional if you put yours otherwise you have to put it

const result = await instance.check(null);
```

Proxy format: <strong>address:port</strong> or <strong>address:port:username:password</strong>

#### Load proxies with file



```javascript
const instance =new ProxyChecker()
    .addProxiesFromFile("./proxies.txt")
    .addDefaultProxyJudge() // -> optional if you put yours otherwise you have to put it
    .addDefaultProxyInformationProvider(); // -> optional if you put yours otherwise you have to put it

const result = await instance.check(null);
```

#### Load proxys with string array



```javascript
const proxies = [
  "103.4.112.18:80",
  "103.4.164.205:8080",
  "103.43.42.85:30477",
  "103.43.7.93:30004",
];
const instance =new ProxyChecker()
    .addProxiesFromArray(proxies)
    .addDefaultProxyJudge() // -> optional if you put yours otherwise you have to put it
    .addDefaultProxyInformationProvider(); // -> optional if you put yours otherwise you have to put it

const result = await instance.check(null);
```

#### Load only one proxy

```javascript
const instance =new ProxyChecker()
    .addOnly1Proxy('myproxy')
    .addDefaultProxyJudge() // -> optional if you put yours otherwise you have to put it
    .addDefaultProxyInformationProvider(); // -> optional if you put yours otherwise you have to put it

const result = await instance.check(null);
```

#### You can combine the 3

```javascript
const instance =new ProxyChecker()
    .addOnly1Proxy('myproxy')
    .addProxiesFromFile("./proxies.txt")
    .addProxiesFromArray(proxies)
    .addDefaultProxyJudge() // -> optional if you put yours otherwise you have to put it
    .addDefaultProxyInformationProvider(); // -> optional if you put yours otherwise you have to put it

const result = await instance.check(null);
```

## Options

#### You can put a callback in order to have the result of each live proxy test so as not to wait for all

```javascript
const instance =new ProxyChecker()
    .addProxiesFromArray(proxies);

const result = await instance.check((result) => {
   console.log(result); // -> Result of proxy1, proxy2, proxy3, ...
});
```

#### You don't have to put addDefaultProxyJudge and addDefaultProxyInformationProvider if you have yours you can add like this

```javascript
const myInformationProviderLinks = ['https://test.com/', 'https://test2.com/']
const myProxyJudgesLinks = ['https://testJudge.com/', 'https://testJudge2.com/']

const instance =new ProxyChecker()
    .addProxiesFromArray(proxies)
    // .addDefaultProxyJudge()
    // .addDefaultProxyInformationProvider();
    .addProxyInformationProvider(myInformationProviderLinks)
    .addProxyJudge(myProxyJudgesLinks);
```

#### Or combine default and yours

```javascript
const myInformationProviderLinks = ['https://test.com/', 'https://test2.com/']
const myProxyJudgesLinks = ['https://testJudge.com/', 'https://testJudge2.com/']

const instance =new ProxyChecker()
    .addProxiesFromArray(proxies)
    .addProxyInformationProvider(myInformationProviderLinks)
    .addProxyJudge(myProxyJudgesLinks)
    .addDefaultProxyJudge() // -> optional if you put yours otherwise you have to put it
    .addDefaultProxyInformationProvider(); // -> optional if you put yours otherwise you have to put it
```

#### You can check the judges proxy link and proxy informations provider link with:


:warning: *Links are automatically checked and filtered when called "check()" those that don't work are ignored*
```javascript
const instance =new ProxyChecker()

const result = await instance.checkProxyJudgeLinks(null) //or instance.checkProxyJudgeLinks((val) => console.log(val)) for direct
const result2 = await instance.checkProxyInformationProviderLinks(null) // or instance.checkProxyInformationProviderLinks((val) => console.log(val)) for direct
```

## Results

- [check()](./src/models/Result.ts)
- [checkProxyInformationProviderLinks()](./src/models/ResultCheckLinks.ts)
- [checkProxyJudgeLinks()](./src/models/ResultCheckLinks.ts)


## Dependencies

- [axios](https://www.npmjs.com/package/axios)
- [socks-proxy-agent](https://www.npmjs.com/package/socks-proxy-agent)
