"use strict";
module.exports = validate20;
module.exports.default = validate20;
const schema22 = { "title": "npm Snap package.json", "type": "object", "required": ["version", "name"], "properties": { "version": { "type": "string", "title": "Version", "pattern": "^(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-((?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\\.(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\\+([0-9a-zA-Z-]+(?:\\.[0-9a-zA-Z-]+)*))?$" }, "name": { "type": "string", "title": "Package Name", "minLength": 1, "maxLength": 214, "pattern": "^(?:@[a-z0-9-*~][a-z0-9-*._~]*/)?[a-z0-9-~][a-z0-9-._~]*$" }, "private": { "type": "boolean", "title": "Private" }, "main": { "type": "string", "title": "Main", "minLength": 1 }, "publishConfig": { "type": "object", "title": "Publish Config", "required": ["registry"], "properties": { "access": { "type": "string", "minLength": 1 }, "registry": { "type": "string", "enum": ["https://registry.npmjs.org", "https://registry.npmjs.org/"] } } }, "repository": { "type": "object", "title": "Repository", "additionalProperties": false, "required": ["type", "url"], "properties": { "type": { "type": "string", "minLength": 1 }, "url": { "type": "string", "minLength": 1 } } } } };
const pattern0 = new RegExp("^(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-((?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\\.(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\\+([0-9a-zA-Z-]+(?:\\.[0-9a-zA-Z-]+)*))?$", "u");
const pattern1 = new RegExp("^(?:@[a-z0-9-*~][a-z0-9-*._~]*/)?[a-z0-9-~][a-z0-9-._~]*$", "u");
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
    if (data.name === undefined) {
        const err1 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "name" }, message: "must have required property '" + "name" + "'" };
        if (vErrors === null) {
            vErrors = [err1];
        }
        else {
            vErrors.push(err1);
        }
        errors++;
    }
    if (data.version !== undefined) {
        let data0 = data.version;
        if (typeof data0 === "string") {
            if (!pattern0.test(data0)) {
                const err2 = { instancePath: instancePath + "/version", schemaPath: "#/properties/version/pattern", keyword: "pattern", params: { pattern: "^(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-((?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\\.(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\\+([0-9a-zA-Z-]+(?:\\.[0-9a-zA-Z-]+)*))?$" }, message: "must match pattern \"" + "^(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-((?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\\.(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\\+([0-9a-zA-Z-]+(?:\\.[0-9a-zA-Z-]+)*))?$" + "\"" };
                if (vErrors === null) {
                    vErrors = [err2];
                }
                else {
                    vErrors.push(err2);
                }
                errors++;
            }
        }
        else {
            const err3 = { instancePath: instancePath + "/version", schemaPath: "#/properties/version/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            if (vErrors === null) {
                vErrors = [err3];
            }
            else {
                vErrors.push(err3);
            }
            errors++;
        }
    }
    if (data.name !== undefined) {
        let data1 = data.name;
        if (typeof data1 === "string") {
            if (func4(data1) > 214) {
                const err4 = { instancePath: instancePath + "/name", schemaPath: "#/properties/name/maxLength", keyword: "maxLength", params: { limit: 214 }, message: "must NOT have more than 214 characters" };
                if (vErrors === null) {
                    vErrors = [err4];
                }
                else {
                    vErrors.push(err4);
                }
                errors++;
            }
            if (func4(data1) < 1) {
                const err5 = { instancePath: instancePath + "/name", schemaPath: "#/properties/name/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
                if (vErrors === null) {
                    vErrors = [err5];
                }
                else {
                    vErrors.push(err5);
                }
                errors++;
            }
            if (!pattern1.test(data1)) {
                const err6 = { instancePath: instancePath + "/name", schemaPath: "#/properties/name/pattern", keyword: "pattern", params: { pattern: "^(?:@[a-z0-9-*~][a-z0-9-*._~]*/)?[a-z0-9-~][a-z0-9-._~]*$" }, message: "must match pattern \"" + "^(?:@[a-z0-9-*~][a-z0-9-*._~]*/)?[a-z0-9-~][a-z0-9-._~]*$" + "\"" };
                if (vErrors === null) {
                    vErrors = [err6];
                }
                else {
                    vErrors.push(err6);
                }
                errors++;
            }
        }
        else {
            const err7 = { instancePath: instancePath + "/name", schemaPath: "#/properties/name/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            if (vErrors === null) {
                vErrors = [err7];
            }
            else {
                vErrors.push(err7);
            }
            errors++;
        }
    }
    if (data.private !== undefined) {
        if (typeof data.private !== "boolean") {
            const err8 = { instancePath: instancePath + "/private", schemaPath: "#/properties/private/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
            if (vErrors === null) {
                vErrors = [err8];
            }
            else {
                vErrors.push(err8);
            }
            errors++;
        }
    }
    if (data.main !== undefined) {
        let data3 = data.main;
        if (typeof data3 === "string") {
            if (func4(data3) < 1) {
                const err9 = { instancePath: instancePath + "/main", schemaPath: "#/properties/main/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
                if (vErrors === null) {
                    vErrors = [err9];
                }
                else {
                    vErrors.push(err9);
                }
                errors++;
            }
        }
        else {
            const err10 = { instancePath: instancePath + "/main", schemaPath: "#/properties/main/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            if (vErrors === null) {
                vErrors = [err10];
            }
            else {
                vErrors.push(err10);
            }
            errors++;
        }
    }
    if (data.publishConfig !== undefined) {
        let data4 = data.publishConfig;
        if (data4 && typeof data4 == "object" && !Array.isArray(data4)) {
            if (data4.registry === undefined) {
                const err11 = { instancePath: instancePath + "/publishConfig", schemaPath: "#/properties/publishConfig/required", keyword: "required", params: { missingProperty: "registry" }, message: "must have required property '" + "registry" + "'" };
                if (vErrors === null) {
                    vErrors = [err11];
                }
                else {
                    vErrors.push(err11);
                }
                errors++;
            }
            if (data4.access !== undefined) {
                let data5 = data4.access;
                if (typeof data5 === "string") {
                    if (func4(data5) < 1) {
                        const err12 = { instancePath: instancePath + "/publishConfig/access", schemaPath: "#/properties/publishConfig/properties/access/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
                        if (vErrors === null) {
                            vErrors = [err12];
                        }
                        else {
                            vErrors.push(err12);
                        }
                        errors++;
                    }
                }
                else {
                    const err13 = { instancePath: instancePath + "/publishConfig/access", schemaPath: "#/properties/publishConfig/properties/access/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    if (vErrors === null) {
                        vErrors = [err13];
                    }
                    else {
                        vErrors.push(err13);
                    }
                    errors++;
                }
            }
            if (data4.registry !== undefined) {
                let data6 = data4.registry;
                if (typeof data6 !== "string") {
                    const err14 = { instancePath: instancePath + "/publishConfig/registry", schemaPath: "#/properties/publishConfig/properties/registry/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    if (vErrors === null) {
                        vErrors = [err14];
                    }
                    else {
                        vErrors.push(err14);
                    }
                    errors++;
                }
                if (!((data6 === "https://registry.npmjs.org") || (data6 === "https://registry.npmjs.org/"))) {
                    const err15 = { instancePath: instancePath + "/publishConfig/registry", schemaPath: "#/properties/publishConfig/properties/registry/enum", keyword: "enum", params: { allowedValues: schema22.properties.publishConfig.properties.registry.enum }, message: "must be equal to one of the allowed values" };
                    if (vErrors === null) {
                        vErrors = [err15];
                    }
                    else {
                        vErrors.push(err15);
                    }
                    errors++;
                }
            }
        }
        else {
            const err16 = { instancePath: instancePath + "/publishConfig", schemaPath: "#/properties/publishConfig/type", keyword: "type", params: { type: "object" }, message: "must be object" };
            if (vErrors === null) {
                vErrors = [err16];
            }
            else {
                vErrors.push(err16);
            }
            errors++;
        }
    }
    if (data.repository !== undefined) {
        let data7 = data.repository;
        if (data7 && typeof data7 == "object" && !Array.isArray(data7)) {
            if (data7.type === undefined) {
                const err17 = { instancePath: instancePath + "/repository", schemaPath: "#/properties/repository/required", keyword: "required", params: { missingProperty: "type" }, message: "must have required property '" + "type" + "'" };
                if (vErrors === null) {
                    vErrors = [err17];
                }
                else {
                    vErrors.push(err17);
                }
                errors++;
            }
            if (data7.url === undefined) {
                const err18 = { instancePath: instancePath + "/repository", schemaPath: "#/properties/repository/required", keyword: "required", params: { missingProperty: "url" }, message: "must have required property '" + "url" + "'" };
                if (vErrors === null) {
                    vErrors = [err18];
                }
                else {
                    vErrors.push(err18);
                }
                errors++;
            }
            for (const key0 in data7) {
                if (!((key0 === "type") || (key0 === "url"))) {
                    const err19 = { instancePath: instancePath + "/repository", schemaPath: "#/properties/repository/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" };
                    if (vErrors === null) {
                        vErrors = [err19];
                    }
                    else {
                        vErrors.push(err19);
                    }
                    errors++;
                }
            }
            if (data7.type !== undefined) {
                let data8 = data7.type;
                if (typeof data8 === "string") {
                    if (func4(data8) < 1) {
                        const err20 = { instancePath: instancePath + "/repository/type", schemaPath: "#/properties/repository/properties/type/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
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
                    const err21 = { instancePath: instancePath + "/repository/type", schemaPath: "#/properties/repository/properties/type/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    if (vErrors === null) {
                        vErrors = [err21];
                    }
                    else {
                        vErrors.push(err21);
                    }
                    errors++;
                }
            }
            if (data7.url !== undefined) {
                let data9 = data7.url;
                if (typeof data9 === "string") {
                    if (func4(data9) < 1) {
                        const err22 = { instancePath: instancePath + "/repository/url", schemaPath: "#/properties/repository/properties/url/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
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
                    const err23 = { instancePath: instancePath + "/repository/url", schemaPath: "#/properties/repository/properties/url/type", keyword: "type", params: { type: "string" }, message: "must be string" };
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
            const err24 = { instancePath: instancePath + "/repository", schemaPath: "#/properties/repository/type", keyword: "type", params: { type: "object" }, message: "must be object" };
            if (vErrors === null) {
                vErrors = [err24];
            }
            else {
                vErrors.push(err24);
            }
            errors++;
        }
    }
}
else {
    const err25 = { instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    if (vErrors === null) {
        vErrors = [err25];
    }
    else {
        vErrors.push(err25);
    }
    errors++;
} validate20.errors = vErrors; return vErrors; }
//# sourceMappingURL=validateNpmSnapPackageJson.js.map