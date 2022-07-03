import {Parser} from "./Parser";
import * as fs from "fs";

export class RegionsParser extends Parser {

    constructor(filePath: fs.PathLike, decompressSaveLocation: fs.PathLike = './') {
        super(filePath, decompressSaveLocation);
    }

}