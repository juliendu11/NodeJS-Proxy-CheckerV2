import {proxySplit} from '../../src/helpers/splitter';

describe('Unit test for helpers/splitter', () => {
    test('Should return 2 chunk when call proxySplit with 192.45.50.320:80', () => {
        const value ='192.45.50.320:80';

        const {values} = proxySplit(value);

        expect(values.length).toBe(2);

        expect(values[0]).toBe(value.split(':')[0]);
        expect(values[1]).toBe(value.split(':')[1]);
    })

    test('Should return 4 chunk when call proxySplit with 192.45.50.320:80:test11:123', () => {
        const value ='192.45.50.320:80:test11:123';

        const {values} = proxySplit(value);

        expect(values.length).toBe(4);
        
        expect(values[0]).toBe(value.split(':')[0]);
        expect(values[1]).toBe(value.split(':')[1]);
        expect(values[2]).toBe(value.split(':')[2]);
        expect(values[3]).toBe(value.split(':')[3]);
    })


    test('Should return hasAuth to true when call proxySplit with 192.45.50.320:80:test11:123', () => {
        const value ='192.45.50.320:80:test11:123';

        const {hasAuth} = proxySplit(value);

        expect(hasAuth).toBe(true);
    })

    test('Should return hasAuth to false when call proxySplit with 192.45.50.320:80', () => {
        const value ='192.45.50.320:80';

        const {hasAuth} = proxySplit(value);

        expect(hasAuth).toBe(false);
    })

    test('Should return goodFormat to true when call proxySplit with 192.45.50.320:80:test11:123', () => {
        const value ='192.45.50.320:80:test11:123';

        const {goodFormat} = proxySplit(value);

        expect(goodFormat).toBe(true);
    })

    test('Should return goodFormat to false when call proxySplit with 192.45.50.320:80:', () => {
        const value ='192.45.50.320:80:';

        const {goodFormat} = proxySplit(value);

        expect(goodFormat).toBe(false);
    })

    test('Should return goodFormat to false when call proxySplit with 192.45.50.320:80:test1', () => {
        const value ='192.45.50.320:80:test1';

        const {goodFormat} = proxySplit(value);

        expect(goodFormat).toBe(false);
    })

    test('Should return goodFormat to false when call proxySplit with 192.45.50.320:80:test1:', () => {
        console.log('e')
        const value ='192.45.50.320:80:test1:';

        const {goodFormat} = proxySplit(value);

        expect(goodFormat).toBe(false);
    })
})