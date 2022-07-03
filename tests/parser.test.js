const parser = require('../dist')
const fs = require("fs");

test('Parser creation with non-existing file', async () => {
    const rp = new parser.RegionsParser('non-existing.xml')
    try {
        await rp.start()
    } catch (e) {
        expect(e.message).toBe('Path to file does not exist: non-existing.xml')
    }
});

test('Parser creation with empty file', async () => {
    const rp = new parser.RegionsParser('tests/empty.xml')
    try {
        await rp.start()
    } catch (e) {
        expect(e.message).toBe('File specified is empty: tests/empty.xml')
    }
});

test('Parser file not readable error', async () => {
    const rp = new parser.RegionsParser('tests/non-readable.xml');
    try {
        await rp.start();
    } catch (e) {
        expect(e.message).toBe('Path to file is not readable: tests/non-readable.xml');
    }
});

test('Parser automatic decompression', async () => {
    const rp = new parser.RegionsParser('tests/compressed.xml.gz');
    expect(rp.info.filePath).toBe('tests/compressed.xml.gz');
    await rp.start();
    expect(rp.info.decompressedFilePath).toBe('tests/compressed.xml');
    expect(fs.existsSync(rp.info.decompressedFilePath)).toBe(true);
    rp.finish(); // Should delete the decompressed file
    expect(fs.existsSync(rp.info.decompressedFilePath)).toBe(false);
});

test('Parser decompressed file exists already error', async () => {
    const rp = new parser.RegionsParser('tests/empty.xml.gz');
    try {
        await rp.start();
    } catch (e) {
        expect(e.message).toBe('Decompressed version of file already exists: tests/empty.xml');
    }
});
