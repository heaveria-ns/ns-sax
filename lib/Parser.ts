import * as fs from "fs";
import * as zlib from "zlib";

export class Parser {
    protected _filePath: fs.PathLike;
    protected _decompressedFilePath: fs.PathLike = null;
    protected _decompressLocation: fs.PathLike = null;

    constructor(filePath: fs.PathLike, decompressSaveLocation: fs.PathLike = './') {
        this._filePath = filePath;
        this._decompressLocation = decompressSaveLocation;
    }

    public get info() {
        return {
            filePath: this._filePath,
            decompressedFilePath: this._decompressedFilePath,
            decompressLocation: this._decompressLocation
        }
    }

    public async start(): Promise<this> {
        await this._fileChecks();
        return this;
    }

    private async _fileChecks(): Promise<void> {
        if (!fs.existsSync(this._filePath)) throw new Error(`Path to file does not exist: ${this._filePath}`);
        if (!fs.statSync(this._filePath).size) throw new Error(`File specified is empty: ${this._filePath}`);
        fs.access(this._filePath, fs.constants.R_OK, (err) => {
            if (err) throw new Error(`Path to file is not readable: ${this._filePath}`);
        });
        if (this._filePath.toString().endsWith(".gz")) {
            this._decompressedFilePath = this._filePath.toString().slice(0, -3);
            if (fs.existsSync(this._decompressedFilePath)) {
                throw new Error(`Decompressed version of file already exists: ${this._decompressedFilePath}`);
            }
            await this._decompressFile();
        }
    }

    private _decompressFile(): Promise<void> {
        const r = fs.createReadStream(this._filePath);
        const w = fs.createWriteStream(this._decompressedFilePath);
        r.pipe(zlib.createGunzip()).pipe(w);
        return new Promise((resolve, reject) => {
            w.on('finish', () => {
                this._filePath = this._decompressedFilePath;
                resolve();
            });
            w.on('error', (err) => {
                fs.unlinkSync(this._decompressedFilePath);
                reject(err);
            });
        });
    }

    public finish(): void {
        if (this._decompressedFilePath) fs.unlinkSync(this._decompressedFilePath);
    }
}