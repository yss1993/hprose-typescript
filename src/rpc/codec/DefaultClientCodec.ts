/*--------------------------------------------------------*\
|                                                          |
|                          hprose                          |
|                                                          |
| Official WebSite: https://hprose.com                     |
|                                                          |
| hprose/rpc/codec/DefaultClientCodec.ts                   |
|                                                          |
| Default ClientCodec for TypeScript.                      |
|                                                          |
| LastModified: Jan 9, 2019                                |
| Author: Ma Bingyao <andot@hprose.com>                    |
|                                                          |
\*________________________________________________________*/

import { Tags, ByteStream, Writer, Reader } from '../../hprose.io';
import { ClientContext } from '../ClientContext';
import { ClientCodec } from '../ClientCodec';

export class DefaultClientCodec implements ClientCodec {
    public static instance: ClientCodec = new DefaultClientCodec();
    public encode(name: string, args: any[], context: ClientContext): Uint8Array {
        const stream = new ByteStream();
        const writer = new Writer(stream, context.simple, context.utc);
        const headers = context.requestHeaders;
        let size = 0;
        for (const _ in headers) { size++; }
        if (size > 0) {
            stream.writeByte(Tags.TagHeader);
            writer.serialize(headers);
            writer.reset();
        }
        stream.writeByte(Tags.TagCall);
        writer.serialize(name);
        if (args.length > 0) {
            writer.reset();
            writer.serialize(args);
        }
        stream.writeByte(Tags.TagEnd);
        return stream.takeBytes();
    }
    public decode(response: Uint8Array, context: ClientContext): any {
        const stream = new ByteStream(response);
        const reader = new Reader(stream, false);
        reader.longType = context.longType;
        reader.dictType = context.dictType;
        let tag = stream.readByte();
        if (tag === Tags.TagHeader) {
            const headers = reader.deserialize();
            for (const name in headers) {
                context.responseHeaders[name] = headers[name];
            }
            reader.reset();
            tag = stream.readByte();
        }
        switch (tag) {
            case Tags.TagResult:
                return reader.deserialize(context.type);
            case Tags.TagError:
                throw new Error(reader.deserialize(String));
            case Tags.TagEnd:
                return context.type === null ? null : undefined;
            default:
                throw new Error('Invalid response:\r\n' + stream.toString());
        }
    }
}