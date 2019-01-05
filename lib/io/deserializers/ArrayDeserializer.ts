/*--------------------------------------------------------*\
|                                                          |
|                          hprose                          |
|                                                          |
| Official WebSite: http://www.hprose.com/                 |
|                   http://www.hprose.org/                 |
|                                                          |
\*________________________________________________________*/
/*--------------------------------------------------------*\
|                                                          |
| hprose/io/deserializers/ArrayDeserializer.ts             |
|                                                          |
| hprose array deserializer for TypeScript.                |
|                                                          |
| LastModified: Jan 6, 2019                                |
| Author: Ma Bingyao <andot@hprose.com>                    |
|                                                          |
\*________________________________________________________*/

import { Tags } from '../Tags';
import { BaseDeserializer } from './BaseDeserializer';
import { Deserializer } from './Deserializer';
import { Reader } from './Reader';
import * as ReferenceReader from './ReferenceReader';

export class ArrayDeserializer extends BaseDeserializer implements Deserializer {
    public static instance: Deserializer = new ArrayDeserializer();
    constructor() { super('Array'); }
    public read(reader: Reader, tag: number): Array<any> {
        switch (tag) {
            case Tags.TagList: return ReferenceReader.readArray(reader);
            case Tags.TagEmpty: return [];
            case Tags.TagString: return ReferenceReader.readString(reader).split('');
            case Tags.TagBytes: return Array.from(ReferenceReader.readBytes(reader));
            default:
                return super.read(reader, tag);
        }
    }
}