import fs from 'fs';
import path from 'path';

interface Layer {
    name: string,
    location: string,
    elements: string[]
};

const absolute_path = __dirname.replace(/\\/g, "/");

// Set a width and height for the canvas
const [width, height] = [2048, 2048];

//returns array of objects containing all the unique layers 
const getAllElements = (pathname: string): Layer["elements"] => {

    // remove extension
    const parseExtension = (fileName: string) => path.parse(fileName).name;

    return fs
      .readdirSync(`${absolute_path}/${pathname}/`)
      .filter((item) => !/(^|\/)\.[^\/\.]/g.test(item))
      .map((fileName) => parseExtension(fileName));
};

const layers: Layer[] = [
    {
        name: "body",
        location: `${absolute_path}/body/`,
        elements: getAllElements("body"),
    },
    {
        name: "skin",
        location: `${absolute_path}/skin/`,
        elements: getAllElements("skin"),
    },
    {
        name: "head",
        location: `${absolute_path}/head/`,
        elements: getAllElements("head"),
    },
    {
        name: "lhand",
        location: `${absolute_path}/lhand/`,
        elements: getAllElements("lhand"),
    },
    {
        name: "rhand",
        location: `${absolute_path}/rhand/`,
        elements: getAllElements("rhand"),
    }
];

export {
    layers,
    Layer,
    width, 
    height
}