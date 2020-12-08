import {proxySplit} from '../../src/helpers/splitter';

describe('Unit test for helpers/splitter', () => {
    test('Should return 2 chunk when call proxySplit with 192.45.50.320:80', () => {
        const value ='192.45.50.320:80';

        const split = proxySplit(value);

        expect(split.length).toBe(2);

        expect(split[0]).toBe(value.split(':')[0]);
        expect(split[1]).toBe(value.split(':')[1]);
    })

    test('Should return 4 chunk when call proxySplit with 192.45.50.320:80:test11:123', () => {
        const value ='192.45.50.320:80:test11:123';

        const split = proxySplit(value);

        expect(split.length).toBe(4);
        
        expect(split[0]).toBe(value.split(':')[0]);
        expect(split[1]).toBe(value.split(':')[1]);
        expect(split[2]).toBe(value.split(':')[2]);
        expect(split[3]).toBe(value.split(':')[3]);
    })
})