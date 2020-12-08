# NodeJS-Proxy-CheckerV2

It's simple Proxy Checker, get proxy status, anonymous level, type, time, country build with Typescript

- [x] Proxy anonymous level
- [x] Proxy country
- [ ] Type
- [ ] Proxy Time

## Install

```bash
npm i nodejs-proxy-checkerv2
```

# How to use ?

```javascript
const proxy_checker = require("nodejs-proxy-checkerv2").default;
const instance =new ProxyChecker()
    .addProxiesFromFile("./proxies.txt")
    .addDefaultProxyJudge() // -> optional if you put yours otherwise you have to put it
    .addDefaultProxyInformationProvider(); // -> optional if you put yours otherwise you have to put it

const result = await instance.check(null);
```

### Load proxies with file

One proxy per line and in this format: address: port

```javascript
const instance =new ProxyChecker()
    .addProxiesFromFile("./proxies.txt")
    .addDefaultProxyJudge() // -> optional if you put yours otherwise you have to put it
    .addDefaultProxyInformationProvider(); // -> optional if you put yours otherwise you have to put it

const result = await instance.check(null);
```

### Load proxys with string array

One proxy per line and in this format: address: port

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

### Load only one proxy

Format: address: port

```javascript
const instance =new ProxyChecker()
    .addOnly1Proxy('myproxy')
    .addDefaultProxyJudge() // -> optional if you put yours otherwise you have to put it
    .addDefaultProxyInformationProvider(); // -> optional if you put yours otherwise you have to put it

const result = await instance.check(null);
```

### You can combine the 3

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

You can put a callback in order to have the result of each live proxy test so as not to wait for everything

```javascript
const instance =new ProxyChecker()
    .addProxiesFromArray(proxies);

const result = await instance.check((result) => {
   console.log(result); // -> Result of proxy1, proxy2, proxy3, ...
});
```

You don't have to put addDefaultProxyJudge and addDefaultProxyInformationProvider if you have yours you can add like this

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

Or combine default and yours

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

## Dependencies

- [axios](https://www.npmjs.com/package/axios)
