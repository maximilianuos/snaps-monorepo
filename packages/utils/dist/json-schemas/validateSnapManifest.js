"use strict";
module.exports = validate20;
module.exports.default = validate20;
const schema22 = { "title": "Snap Manifest", "description": "The Snap manifest file MUST be named `snap.manifest.json` and located in the package root directory.", "type": "object", "additionalProperties": false, "required": ["version", "description", "proposedName", "source", "initialPermissions", "manifestVersion"], "properties": { "version": { "type": "string", "title": "Version", "description": "MUST be a valid SemVer version string and equal to the corresponding `package.json` field.", "pattern": "^(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-((?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\\.(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\\+([0-9a-zA-Z-]+(?:\\.[0-9a-zA-Z-]+)*))?$" }, "description": { "type": "string", "title": "Description", "description": "MUST be a non-empty string less than or equal to 280 characters. A short description of the Snap.", "minLength": 1, "maxLength": 280 }, "proposedName": { "type": "string", "title": "Proposed Name", "description": "MUST be a string less than or equal to 214 characters. The Snap author's proposed name for the Snap. The Snap host application may display this name unmodified in its user interface. The proposed name SHOULD be human-readable.", "minLength": 1, "maxLength": 214, "pattern": "^(?:[A-Za-z0-9-_]+( [A-Za-z0-9-_]+)*)|(?:(?:@[A-Za-z0-9-*~][A-Za-z0-9-*._~]*/)?[A-Za-z0-9-~][A-Za-z0-9-._~]*)$" }, "repository": { "title": "Repository", "description": "MAY be omitted. If present, MUST be equal to the corresponding package.json field.", "oneOf": [{ "type": "null" }, { "type": "object", "additionalProperties": false, "required": ["type", "url"], "properties": { "type": { "type": "string", "minLength": 1 }, "url": { "type": "string", "minLength": 1 } } }] }, "source": { "type": "object", "title": "Source", "description": "Specifies some Snap metadata and where to fetch the Snap during installation.", "additionalProperties": false, "required": ["shasum", "location"], "properties": { "shasum": { "type": "string", "description": "MUST be the Base64-encoded string representation of the SHA-256 hash of the Snap source file.", "minLength": 44, "maxLength": 44, "pattern": "^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$" }, "location": { "title": "Source Location", "type": "object", "additionalProperties": false, "required": ["npm"], "properties": { "npm": { "title": "npm", "type": "object", "additionalProperties": false, "required": ["filePath", "packageName", "registry"], "properties": { "filePath": { "type": "string", "title": "File Path", "description": "The path to the Snap bundle file from the project root directory.", "minLength": 1 }, "iconPath": { "type": "string", "title": "Icon Path", "description": "The path to an .svg file from the project root directory.", "pattern": "\\w+\\.svg$" }, "packageName": { "type": "string", "title": "Package Name", "description": "The Snap's npm package name.", "minLength": 1 }, "registry": { "type": "string", "title": "npm Registry", "description": "The npm registry URL.", "enum": ["https://registry.npmjs.org", "https://registry.npmjs.org/"] } } } } } } }, "initialPermissions": { "type": "object", "title": "Initial Permissions", "description": "MUST be a valid EIP-2255 wallet_requestPermissions parameter object, specifying the initial permissions that will be requested when the Snap is added to the host application." }, "manifestVersion": { "type": "string", "title": "Manifest Version", "description": "The Snap manifest specification version targeted by the manifest.", "enum": ["0.1"] } } };
const pattern0 = new RegExp("^(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-((?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\\.(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\\+([0-9a-zA-Z-]+(?:\\.[0-9a-zA-Z-]+)*))?$", "u");
const pattern1 = new RegExp("^(?:[A-Za-z0-9-_]+( [A-Za-z0-9-_]+)*)|(?:(?:@[A-Za-z0-9-*~][A-Za-z0-9-*._~]*/)?[A-Za-z0-9-~][A-Za-z0-9-._~]*)$", "u");
const pattern2 = new RegExp("^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$", "u");
const pattern3 = new RegExp("\\w+\\.svg$", "u");
const func4 = require("ajv/dist/runtime/ucs2length").default;
function validate20(data, { instancePath = "", parentData, parentDataProperty, rootData = data } = {}) { let vErrors = null; let errors = 0; if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.version === undefined) {
        const err0 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "version" }, message: "must have required property '" + "version" + "'" };
        if (vErrors === null) {
            vErrors = [err0];
        }
        else {
            vErrors.push(err0);
        }
        errors++;
    }
    if (data.description === undefined) {
        const err1 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "description" }, message: "must have required property '" + "description" + "'" };
        if (vErrors === null) {
            vErrors = [err1];
        }
        else {
            vErrors.push(err1);
        }
        errors++;
    }
    if (data.proposedName === undefined) {
        const err2 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "proposedName" }, message: "must have required property '" + "proposedName" + "'" };
        if (vErrors === null) {
            vErrors = [err2];
        }
        else {
            vErrors.push(err2);
        }
        errors++;
    }
    if (data.source === undefined) {
        const err3 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "source" }, message: "must have required property '" + "source" + "'" };
        if (vErrors === null) {
            vErrors = [err3];
        }
        else {
            vErrors.push(err3);
        }
        errors++;
    }
    if (data.initialPermissions === undefined) {
        const err4 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "initialPermissions" }, message: "must have required property '" + "initialPermissions" + "'" };
        if (vErrors === null) {
            vErrors = [err4];
        }
        else {
            vErrors.push(err4);
        }
        errors++;
    }
    if (data.manifestVersion === undefined) {
        const err5 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "manifestVersion" }, message: "must have required property '" + "manifestVersion" + "'" };
        if (vErrors === null) {
            vErrors = [err5];
        }
        else {
            vErrors.push(err5);
        }
        errors++;
    }
    for (const key0 in data) {
        if (!(((((((key0 === "version") || (key0 === "description")) || (key0 === "proposedName")) || (key0 === "repository")) || (key0 === "source")) || (key0 === "initialPermissions")) || (key0 === "manifestVersion"))) {
            const err6 = { instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" };
            if (vErrors === null) {
                vErrors = [err6];
            }
            else {
                vErrors.push(err6);
            }
            errors++;
        }
    }
    if (data.version !== undefined) {
        let data0 = data.version;
        if (typeof data0 === "string") {
            if (!pattern0.test(data0)) {
                const err7 = { instancePath: instancePath + "/version", schemaPath: "#/properties/version/pattern", keyword: "pattern", params: { pattern: "^(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-((?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\\.(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\\+([0-9a-zA-Z-]+(?:\\.[0-9a-zA-Z-]+)*))?$" }, message: "must match pattern \"" + "^(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-((?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\\.(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\\+([0-9a-zA-Z-]+(?:\\.[0-9a-zA-Z-]+)*))?$" + "\"" };
                if (vErrors === null) {
                    vErrors = [err7];
                }
                else {
                    vErrors.push(err7);
                }
                errors++;
            }
        }
        else {
            const err8 = { instancePath: instancePath + "/version", schemaPath: "#/properties/version/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            if (vErrors === null) {
                vErrors = [err8];
            }
            else {
                vErrors.push(err8);
            }
            errors++;
        }
    }
    if (data.description !== undefined) {
        let data1 = data.description;
        if (typeof data1 === "string") {
            if (func4(data1) > 280) {
                const err9 = { instancePath: instancePath + "/description", schemaPath: "#/properties/description/maxLength", keyword: "maxLength", params: { limit: 280 }, message: "must NOT have more than 280 characters" };
                if (vErrors === null) {
                    vErrors = [err9];
                }
                else {
                    vErrors.push(err9);
                }
                errors++;
            }
            if (func4(data1) < 1) {
                const err10 = { instancePath: instancePath + "/description", schemaPath: "#/properties/description/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
                if (vErrors === null) {
                    vErrors = [err10];
                }
                else {
                    vErrors.push(err10);
                }
                errors++;
            }
        }
        else {
            const err11 = { instancePath: instancePath + "/description", schemaPath: "#/properties/description/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            if (vErrors === null) {
                vErrors = [err11];
            }
            else {
                vErrors.push(err11);
            }
            errors++;
        }
    }
    if (data.proposedName !== undefined) {
        let data2 = data.proposedName;
        if (typeof data2 === "string") {
            if (func4(data2) > 214) {
                const err12 = { instancePath: instancePath + "/proposedName", schemaPath: "#/properties/proposedName/maxLength", keyword: "maxLength", params: { limit: 214 }, message: "must NOT have more than 214 characters" };
                if (vErrors === null) {
                    vErrors = [err12];
                }
                else {
                    vErrors.push(err12);
                }
                errors++;
            }
            if (func4(data2) < 1) {
                const err13 = { instancePath: instancePath + "/proposedName", schemaPath: "#/properties/proposedName/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
                if (vErrors === null) {
                    vErrors = [err13];
                }
                else {
                    vErrors.push(err13);
                }
                errors++;
            }
            if (!pattern1.test(data2)) {
                const err14 = { instancePath: instancePath + "/proposedName", schemaPath: "#/properties/proposedName/pattern", keyword: "pattern", params: { pattern: "^(?:[A-Za-z0-9-_]+( [A-Za-z0-9-_]+)*)|(?:(?:@[A-Za-z0-9-*~][A-Za-z0-9-*._~]*/)?[A-Za-z0-9-~][A-Za-z0-9-._~]*)$" }, message: "must match pattern \"" + "^(?:[A-Za-z0-9-_]+( [A-Za-z0-9-_]+)*)|(?:(?:@[A-Za-z0-9-*~][A-Za-z0-9-*._~]*/)?[A-Za-z0-9-~][A-Za-z0-9-._~]*)$" + "\"" };
                if (vErrors === null) {
                    vErrors = [err14];
                }
                else {
                    vErrors.push(err14);
                }
                errors++;
            }
        }
        else {
            const err15 = { instancePath: instancePath + "/proposedName", schemaPath: "#/properties/proposedName/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            if (vErrors === null) {
                vErrors = [err15];
            }
            else {
                vErrors.push(err15);
            }
            errors++;
        }
    }
    if (data.repository !== undefined) {
        let data3 = data.repository;
        const _errs9 = errors;
        let valid1 = false;
        let passing0 = null;
        const _errs10 = errors;
        if (data3 !== null) {
            const err16 = { instancePath: instancePath + "/repository", schemaPath: "#/properties/repository/oneOf/0/type", keyword: "type", params: { type: "null" }, message: "must be null" };
            if (vErrors === null) {
                vErrors = [err16];
            }
            else {
                vErrors.push(err16);
            }
            errors++;
        }
        var _valid0 = _errs10 === errors;
        if (_valid0) {
            valid1 = true;
            passing0 = 0;
        }
        const _errs12 = errors;
        if (data3 && typeof data3 == "object" && !Array.isArray(data3)) {
            if (data3.type === undefined) {
                const err17 = { instancePath: instancePath + "/repository", schemaPath: "#/properties/repository/oneOf/1/required", keyword: "required", params: { missingProperty: "type" }, message: "must have required property '" + "type" + "'" };
                if (vErrors === null) {
                    vErrors = [err17];
                }
                else {
                    vErrors.push(err17);
                }
                errors++;
            }
            if (data3.url === undefined) {
                const err18 = { instancePath: instancePath + "/repository", schemaPath: "#/properties/repository/oneOf/1/required", keyword: "required", params: { missingProperty: "url" }, message: "must have required property '" + "url" + "'" };
                if (vErrors === null) {
                    vErrors = [err18];
                }
                else {
                    vErrors.push(err18);
                }
                errors++;
            }
            for (const key1 in data3) {
                if (!((key1 === "type") || (key1 === "url"))) {
                    const err19 = { instancePath: instancePath + "/repository", schemaPath: "#/properties/repository/oneOf/1/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key1 }, message: "must NOT have additional properties" };
                    if (vErrors === null) {
                        vErrors = [err19];
                    }
                    else {
                        vErrors.push(err19);
                    }
                    errors++;
                }
            }
            if (data3.type !== undefined) {
                let data4 = data3.type;
                if (typeof data4 === "string") {
                    if (func4(data4) < 1) {
                        const err20 = { instancePath: instancePath + "/repository/type", schemaPath: "#/properties/repository/oneOf/1/properties/type/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
                        if (vErrors === null) {
                            vErrors = [err20];
                        }
                        else {
                            vErrors.push(err20);
                        }
                        errors++;
                    }
                }
                else {
                    const err21 = { instancePath: instancePath + "/repository/type", schemaPath: "#/properties/repository/oneOf/1/properties/type/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    if (vErrors === null) {
                        vErrors = [err21];
                    }
                    else {
                        vErrors.push(err21);
                    }
                    errors++;
                }
            }
            if (data3.url !== undefined) {
                let data5 = data3.url;
                if (typeof data5 === "string") {
                    if (func4(data5) < 1) {
                        const err22 = { instancePath: instancePath + "/repository/url", schemaPath: "#/properties/repository/oneOf/1/properties/url/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
                        if (vErrors === null) {
                            vErrors = [err22];
                        }
                        else {
                            vErrors.push(err22);
                        }
                        errors++;
                    }
                }
                else {
                    const err23 = { instancePath: instancePath + "/repository/url", schemaPath: "#/properties/repository/oneOf/1/properties/url/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    if (vErrors === null) {
                        vErrors = [err23];
                    }
                    else {
                        vErrors.push(err23);
                    }
                    errors++;
                }
            }
        }
        else {
            const err24 = { instancePath: instancePath + "/repository", schemaPath: "#/properties/repository/oneOf/1/type", keyword: "type", params: { type: "object" }, message: "must be object" };
            if (vErrors === null) {
                vErrors = [err24];
            }
            else {
                vErrors.push(err24);
            }
            errors++;
        }
        var _valid0 = _errs12 === errors;
        if (_valid0 && valid1) {
            valid1 = false;
            passing0 = [passing0, 1];
        }
        else {
            if (_valid0) {
                valid1 = true;
                passing0 = 1;
            }
        }
        if (!valid1) {
            const err25 = { instancePath: instancePath + "/repository", schemaPath: "#/properties/repository/oneOf", keyword: "oneOf", params: { passingSchemas: passing0 }, message: "must match exactly one schema in oneOf" };
            if (vErrors === null) {
                vErrors = [err25];
            }
            else {
                vErrors.push(err25);
            }
            errors++;
        }
        else {
            errors = _errs9;
            if (vErrors !== null) {
                if (_errs9) {
                    vErrors.length = _errs9;
                }
                else {
                    vErrors = null;
                }
            }
        }
    }
    if (data.source !== undefined) {
        let data6 = data.source;
        if (data6 && typeof data6 == "object" && !Array.isArray(data6)) {
            if (data6.shasum === undefined) {
                const err26 = { instancePath: instancePath + "/source", schemaPath: "#/properties/source/required", keyword: "required", params: { missingProperty: "shasum" }, message: "must have required property '" + "shasum" + "'" };
                if (vErrors === null) {
                    vErrors = [err26];
                }
                else {
                    vErrors.push(err26);
                }
                errors++;
            }
            if (data6.location === undefined) {
                const err27 = { instancePath: instancePath + "/source", schemaPath: "#/properties/source/required", keyword: "required", params: { missingProperty: "location" }, message: "must have required property '" + "location" + "'" };
                if (vErrors === null) {
                    vErrors = [err27];
                }
                else {
                    vErrors.push(err27);
                }
                errors++;
            }
            for (const key2 in data6) {
                if (!((key2 === "shasum") || (key2 === "location"))) {
                    const err28 = { instancePath: instancePath + "/source", schemaPath: "#/properties/source/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key2 }, message: "must NOT have additional properties" };
                    if (vErrors === null) {
                        vErrors = [err28];
                    }
                    else {
                        vErrors.push(err28);
                    }
                    errors++;
                }
            }
            if (data6.shasum !== undefined) {
                let data7 = data6.shasum;
                if (typeof data7 === "string") {
                    if (func4(data7) > 44) {
                        const err29 = { instancePath: instancePath + "/source/shasum", schemaPath: "#/properties/source/properties/shasum/maxLength", keyword: "maxLength", params: { limit: 44 }, message: "must NOT have more than 44 characters" };
                        if (vErrors === null) {
                            vErrors = [err29];
                        }
                        else {
                            vErrors.push(err29);
                        }
                        errors++;
                    }
                    if (func4(data7) < 44) {
                        const err30 = { instancePath: instancePath + "/source/shasum", schemaPath: "#/properties/source/properties/shasum/minLength", keyword: "minLength", params: { limit: 44 }, message: "must NOT have fewer than 44 characters" };
                        if (vErrors === null) {
                            vErrors = [err30];
                        }
                        else {
                            vErrors.push(err30);
                        }
                        errors++;
                    }
                    if (!pattern2.test(data7)) {
                        const err31 = { instancePath: instancePath + "/source/shasum", schemaPath: "#/properties/source/properties/shasum/pattern", keyword: "pattern", params: { pattern: "^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$" }, message: "must match pattern \"" + "^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$" + "\"" };
                        if (vErrors === null) {
                            vErrors = [err31];
                        }
                        else {
                            vErrors.push(err31);
                        }
                        errors++;
                    }
                }
                else {
                    const err32 = { instancePath: instancePath + "/source/shasum", schemaPath: "#/properties/source/properties/shasum/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    if (vErrors === null) {
                        vErrors = [err32];
                    }
                    else {
                        vErrors.push(err32);
                    }
                    errors++;
                }
            }
            if (data6.location !== undefined) {
                let data8 = data6.location;
                if (data8 && typeof data8 == "object" && !Array.isArray(data8)) {
                    if (data8.npm === undefined) {
                        const err33 = { instancePath: instancePath + "/source/location", schemaPath: "#/properties/source/properties/location/required", keyword: "required", params: { missingProperty: "npm" }, message: "must have required property '" + "npm" + "'" };
                        if (vErrors === null) {
                            vErrors = [err33];
                        }
                        else {
                            vErrors.push(err33);
                        }
                        errors++;
                    }
                    for (const key3 in data8) {
                        if (!(key3 === "npm")) {
                            const err34 = { instancePath: instancePath + "/source/location", schemaPath: "#/properties/source/properties/location/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key3 }, message: "must NOT have additional properties" };
                            if (vErrors === null) {
                                vErrors = [err34];
                            }
                            else {
                                vErrors.push(err34);
                            }
                            errors++;
                        }
                    }
                    if (data8.npm !== undefined) {
                        let data9 = data8.npm;
                        if (data9 && typeof data9 == "object" && !Array.isArray(data9)) {
                            if (data9.filePath === undefined) {
                                const err35 = { instancePath: instancePath + "/source/location/npm", schemaPath: "#/properties/source/properties/location/properties/npm/required", keyword: "required", params: { missingProperty: "filePath" }, message: "must have required property '" + "filePath" + "'" };
                                if (vErrors === null) {
                                    vErrors = [err35];
                                }
                                else {
                                    vErrors.push(err35);
                                }
                                errors++;
                            }
                            if (data9.packageName === undefined) {
                                const err36 = { instancePath: instancePath + "/source/location/npm", schemaPath: "#/properties/source/properties/location/properties/npm/required", keyword: "required", params: { missingProperty: "packageName" }, message: "must have required property '" + "packageName" + "'" };
                                if (vErrors === null) {
                                    vErrors = [err36];
                                }
                                else {
                                    vErrors.push(err36);
                                }
                                errors++;
                            }
                            if (data9.registry === undefined) {
                                const err37 = { instancePath: instancePath + "/source/location/npm", schemaPath: "#/properties/source/properties/location/properties/npm/required", keyword: "required", params: { missingProperty: "registry" }, message: "must have required property '" + "registry" + "'" };
                                if (vErrors === null) {
                                    vErrors = [err37];
                                }
                                else {
                                    vErrors.push(err37);
                                }
                                errors++;
                            }
                            for (const key4 in data9) {
                                if (!((((key4 === "filePath") || (key4 === "iconPath")) || (key4 === "packageName")) || (key4 === "registry"))) {
                                    const err38 = { instancePath: instancePath + "/source/location/npm", schemaPath: "#/properties/source/properties/location/properties/npm/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key4 }, message: "must NOT have additional properties" };
                                    if (vErrors === null) {
                                        vErrors = [err38];
                                    }
                                    else {
                                        vErrors.push(err38);
                                    }
                                    errors++;
                                }
                            }
                            if (data9.filePath !== undefined) {
                                let data10 = data9.filePath;
                                if (typeof data10 === "string") {
                                    if (func4(data10) < 1) {
                                        const err39 = { instancePath: instancePath + "/source/location/npm/filePath", schemaPath: "#/properties/source/properties/location/properties/npm/properties/filePath/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
                                        if (vErrors === null) {
                                            vErrors = [err39];
                                        }
                                        else {
                                            vErrors.push(err39);
                                        }
                                        errors++;
                                    }
                                }
                                else {
                                    const err40 = { instancePath: instancePath + "/source/location/npm/filePath", schemaPath: "#/properties/source/properties/location/properties/npm/properties/filePath/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                                    if (vErrors === null) {
                                        vErrors = [err40];
                                    }
                                    else {
                                        vErrors.push(err40);
                                    }
                                    errors++;
                                }
                            }
                            if (data9.iconPath !== undefined) {
                                let data11 = data9.iconPath;
                                if (typeof data11 === "string") {
                                    if (!pattern3.test(data11)) {
                                        const err41 = { instancePath: instancePath + "/source/location/npm/iconPath", schemaPath: "#/properties/source/properties/location/properties/npm/properties/iconPath/pattern", keyword: "pattern", params: { pattern: "\\w+\\.svg$" }, message: "must match pattern \"" + "\\w+\\.svg$" + "\"" };
                                        if (vErrors === null) {
                                            vErrors = [err41];
                                        }
                                        else {
                                            vErrors.push(err41);
                                        }
                                        errors++;
                                    }
                                }
                                else {
                                    const err42 = { instancePath: instancePath + "/source/location/npm/iconPath", schemaPath: "#/properties/source/properties/location/properties/npm/properties/iconPath/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                                    if (vErrors === null) {
                                        vErrors = [err42];
                                    }
                                    else {
                                        vErrors.push(err42);
                                    }
                                    errors++;
                                }
                            }
                            if (data9.packageName !== undefined) {
                                let data12 = data9.packageName;
                                if (typeof data12 === "string") {
                                    if (func4(data12) < 1) {
                                        const err43 = { instancePath: instancePath + "/source/location/npm/packageName", schemaPath: "#/properties/source/properties/location/properties/npm/properties/packageName/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
                                        if (vErrors === null) {
                                            vErrors = [err43];
                                        }
                                        else {
                                            vErrors.push(err43);
                                        }
                                        errors++;
                                    }
                                }
                                else {
                                    const err44 = { instancePath: instancePath + "/source/location/npm/packageName", schemaPath: "#/properties/source/properties/location/properties/npm/properties/packageName/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                                    if (vErrors === null) {
                                        vErrors = [err44];
                                    }
                                    else {
                                        vErrors.push(err44);
                                    }
                                    errors++;
                                }
                            }
                            if (data9.registry !== undefined) {
                                let data13 = data9.registry;
                                if (typeof data13 !== "string") {
                                    const err45 = { instancePath: instancePath + "/source/location/npm/registry", schemaPath: "#/properties/source/properties/location/properties/npm/properties/registry/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                                    if (vErrors === null) {
                                        vErrors = [err45];
                                    }
                                    else {
                                        vErrors.push(err45);
                                    }
                                    errors++;
                                }
                                if (!((data13 === "https://registry.npmjs.org") || (data13 === "https://registry.npmjs.org/"))) {
                                    const err46 = { instancePath: instancePath + "/source/location/npm/registry", schemaPath: "#/properties/source/properties/location/properties/npm/properties/registry/enum", keyword: "enum", params: { allowedValues: schema22.properties.source.properties.location.properties.npm.properties.registry.enum }, message: "must be equal to one of the allowed values" };
                                    if (vErrors === null) {
                                        vErrors = [err46];
                                    }
                                    else {
                                        vErrors.push(err46);
                                    }
                                    errors++;
                                }
                            }
                        }
                        else {
                            const err47 = { instancePath: instancePath + "/source/location/npm", schemaPath: "#/properties/source/properties/location/properties/npm/type", keyword: "type", params: { type: "object" }, message: "must be object" };
                            if (vErrors === null) {
                                vErrors = [err47];
                            }
                            else {
                                vErrors.push(err47);
                            }
                            errors++;
                        }
                    }
                }
                else {
                    const err48 = { instancePath: instancePath + "/source/location", schemaPath: "#/properties/source/properties/location/type", keyword: "type", params: { type: "object" }, message: "must be object" };
                    if (vErrors === null) {
                        vErrors = [err48];
                    }
                    else {
                        vErrors.push(err48);
                    }
                    errors++;
                }
            }
        }
        else {
            const err49 = { instancePath: instancePath + "/source", schemaPath: "#/properties/source/type", keyword: "type", params: { type: "object" }, message: "must be object" };
            if (vErrors === null) {
                vErrors = [err49];
            }
            else {
                vErrors.push(err49);
            }
            errors++;
        }
    }
    if (data.initialPermissions !== undefined) {
        let data14 = data.initialPermissions;
        if (!(data14 && typeof data14 == "object" && !Array.isArray(data14))) {
            const err50 = { instancePath: instancePath + "/initialPermissions", schemaPath: "#/properties/initialPermissions/type", keyword: "type", params: { type: "object" }, message: "must be object" };
            if (vErrors === null) {
                vErrors = [err50];
            }
            else {
                vErrors.push(err50);
            }
            errors++;
        }
    }
    if (data.manifestVersion !== undefined) {
        let data15 = data.manifestVersion;
        if (typeof data15 !== "string") {
            const err51 = { instancePath: instancePath + "/manifestVersion", schemaPath: "#/properties/manifestVersion/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            if (vErrors === null) {
                vErrors = [err51];
            }
            else {
                vErrors.push(err51);
            }
            errors++;
        }
        if (!(data15 === "0.1")) {
            const err52 = { instancePath: instancePath + "/manifestVersion", schemaPath: "#/properties/manifestVersion/enum", keyword: "enum", params: { allowedValues: schema22.properties.manifestVersion.enum }, message: "must be equal to one of the allowed values" };
            if (vErrors === null) {
                vErrors = [err52];
            }
            else {
                vErrors.push(err52);
            }
            errors++;
        }
    }
}
else {
    const err53 = { instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    if (vErrors === null) {
        vErrors = [err53];
    }
    else {
        vErrors.push(err53);
    }
    errors++;
} validate20.errors = vErrors; return vErrors; }
//# sourceMappingURL=validateSnapManifest.js.map