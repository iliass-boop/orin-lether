const fs = require('fs');
const path = require('path');

// A very basic uncompressed text glTF representing a box
const gltfContent = {
    "asset": {
        "version": "2.0",
        "generator": "custom_script"
    },
    "scenes": [
        {
            "nodes": [0]
        }
    ],
    "scene": 0,
    "nodes": [
        {
            "mesh": 0
        }
    ],
    "meshes": [
        {
            "primitives": [
                {
                    "attributes": {
                        "POSITION": 1,
                        "NORMAL": 2,
                        "TEXCOORD_0": 3
                    },
                    "indices": 0,
                    "material": 0
                }
            ]
        }
    ],
    "materials": [
        {
            "pbrMetallicRoughness": {
                "baseColorFactor": [0.5, 0.4, 0.3, 1.0],
                "metallicFactor": 0.1,
                "roughnessFactor": 0.8
            }
        }
    ],
    "buffers": [
        {
            "uri": "data:application/octet-stream;base64,AAABAAIAAwACAAEAAgADAAQABQAEAAMABQAGAAcACAAGAAUACAAJAAoACwAJAAgACwAMAA0ADgAMAAsADgAPABAAEQAPAA4AEQASABMAFAASABEAFQAWABcAGAAWABUAGAAZABoAGwAZABgAGwAcAB0AHgAdABwAHgAfACAAIQAgAB8AIQAiACMAJAAlACQAJQAmACcAKAApACoAKwAsAC0ALgAvADAAMQAyADMANAA1ADYANwA4ADkAOgA7ADwAPQA+AD8AQABBAEIAQwBEAEUARgBHAEgASQBKAEsATABNAE4ATwBQAFEAUgBTAFQAVQBWAFcAWABZAFoAWwBcAF0AXgBfAGAAYQBiAGMAZABlAGYAZwBoAGkAagBrAGwAbQBuAG8AcABxAHIAcwB0AHUAdgB3AHgAeQB6AHsAfAB9AH4AfwCBAIIAgwCEAIUAhgCHAIgAiQCKAIwAjQCOAI8AkACRAJIAkwCUAJUAlgCXAJgAmQCaAJsAnACdAJ4Anw==",
            "byteLength": 360
        },
        {
            "uri": "data:application/octet-stream;base64,AACAPwAAgD8AAIC/AACAvwAAgD8AAIC/AACAvwAAgL8AAIC/AACAPwAAgL8AAIC/AACAPwAAgD8AAIC/AACAvwAAgD8AAIC/AACAPwAAgD8AAIA/AACAvwAAgD8AAIA/AACAPwAAgL8AAIA/AACAvwAAgL8AAIA/AACAvwAAgL8AAIC/AACAPwAAgL8AAIC/AACAvwAAgD8AAIC/AACAvwAAgD8AAIA/AACAvwAAgD8AAIA/AACAPwAAgD8AAIA/AACAPwAAgL8AAIA/AACAPwAAgL8AAIA/AAC/AACAPwAAgL8AAIC/AACAPwAAgL8AAIA/AACAPwAAgD8AAIA/AACAPwAAgD8AAIA/AACAPwAAgL8AAIA/AACAvwAAgL8AAIC/AACAPwAAgL8AAIC/AACAPwAAgL8AAIC/AACAPwAAgL8AAIC/AACAvwAAgL8AAIC/AACAvwAAgL8AAIC/AACAvwAAgL8AAIC/",
            "byteLength": 288
        },
        {
            "uri": "data:application/octet-stream;base64,AAAAAAAAgD8AAIA/AACAPwAAgD8AAIC/AAAAAAAAgL8AAIC/AACAvwAAgL8AAIA/AAAAAAAAgD8AAIA/AACAPwAAgD8AAIC/AAAAAAAAgL8AAIC/AACAvwAAgL8AAIA/AAAAAAAAgD8AAIA/AACAPwAAgD8AAIC/AAAAAAAAgL8AAIC/AACAvwAAgL8AAIA/AAAAAAAAgD8AAIA/AACAPwAAgD8AAIC/AAAAAAAAgL8AAIC/AACAvwAAgL8AAIA/AAAAAAAAgD8AAIA/AACAPwAAgD8AAIC/AAAAAAAAgL8AAIC/AACAvwAAgL8AAIA/AAAAAAAAgD8AAIA/AACAPwAAgD8AAIC/AAAAAAAAgL8AAIC/AACAvwAAgL8AAIA/",
            "byteLength": 288
        },
        {
            "uri": "data:application/octet-stream;base64,AAAAAAAAgD8AAIA/AAAAAAAAgD8AAIA/AAAAAAAAgD8AAIA/AAAAAAAAgD8AAIA/AAAAAAAAgD8AAIA/AAAAAAAAgD8AAIA/AAAAAAAAgD8AAIA/AAAAAAAAgD8AAIA/AAAAAAAAgD8AAIA/AAAAAAAAgD8AAIA/AAAAAAAAgD8AAIA/AAAAAAAAgD8AAIA/AAAAAAAAgD8AAIA/AAAAAAAAgD8AAIA/AAAAAAAAgD8AAIA/AAAAAAAAgD8AAIA/AAAAAAAAgD8AAIA/AAAAAAAAgD8AAIA/AAAAAAAAgD8AAIA/AAAAAAAAgD8AAIA/AAAAAAAAgD8AAIA/AAAAAAAAgD8AAIA/AAAAAAAAgD8AAIA/AAAAAAAAgD8AAIA/",
            "byteLength": 192
        }
    ],
    "bufferViews": [
        {
            "buffer": 0,
            "byteOffset": 0,
            "byteLength": 360,
            "target": 34963
        },
        {
            "buffer": 1,
            "byteOffset": 0,
            "byteLength": 288,
            "target": 34962
        },
        {
            "buffer": 2,
            "byteOffset": 0,
            "byteLength": 288,
            "target": 34962
        },
        {
            "buffer": 3,
            "byteOffset": 0,
            "byteLength": 192,
            "target": 34962
        }
    ],
    "accessors": [
        {
            "bufferView": 0,
            "byteOffset": 0,
            "componentType": 5123,
            "count": 36,
            "type": "SCALAR",
            "max": [23],
            "min": [0]
        },
        {
            "bufferView": 1,
            "byteOffset": 0,
            "componentType": 5126,
            "count": 24,
            "type": "VEC3",
            "max": [0.5, 0.5, 0.5],
            "min": [-0.5, -0.5, -0.5]
        },
        {
            "bufferView": 2,
            "byteOffset": 0,
            "componentType": 5126,
            "count": 24,
            "type": "VEC3",
            "max": [1.0, 1.0, 1.0],
            "min": [-1.0, -1.0, -1.0]
        },
        {
            "bufferView": 3,
            "byteOffset": 0,
            "componentType": 5126,
            "count": 24,
            "type": "VEC2",
            "max": [1.0, 1.0],
            "min": [0.0, 0.0]
        }
    ]
};

const dir = path.join(__dirname, 'public', 'models');
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

const outputPath = path.join(dir, 'placeholder.gltf');
fs.writeFileSync(outputPath, JSON.stringify(gltfContent, null, 2));
console.log('Generated placeholder.gltf');
