const cliArgs = require('command-line-args')
const lodash = require('lodash')
const jimp = require('jimp')
const kMean = require('node-kmeans')

/**
 * Uses jimp to extract the pixel in an image at imagePath.
 * It returns the jimp image object and a linear data array of all pixels in the
 * image.
 * 
 * @param {*} imagePath 
 */
async function extractImageData(imagePath) {
    const image = (await jimp.read(imagePath)).clone()
    const { width, height } =  image.bitmap
    const data = []
    for(let i = 0; i < width; i++) {
        for(let j = 0; j < height; j++) {
            const { r, g, b } = jimp.intToRGBA(image.getPixelColor(i, j))
            data.push([ r, g, b ])
        }
    }

    return { data, image }
}

/**
 * Saves the imageData array using the jimp image object.
 * 
 * @param {*} image 
 * @param {*} imageData 
 */
async function saveImageData(image, imageData) {
    const { width, height } =  image.bitmap
    for(let i = 0; i < width; i++) {
        for(let j = 0; j < height; j++) {
            let [ r, g, b ] = imageData[i * height + j]
            // console.log(`r: ${r}, g: ${g}, b: ${b}`)
            const pixel = jimp.rgbaToInt(r, g, b, 255)
            image.setPixelColor(pixel, i, j)
        }
    }
    image.write('convert.jpg')
}

/**
 * Compute the distance (euclidean) between two colors
 * 
 * @param {[ r, g, b ]} color1 
 * @param {[ r, g, b ]} color2
 */
function distance(color1, color2) {
    const [ r1, g1, b1 ] = color1
    const [ r2, g2, b2 ] = color2
    return Math.sqrt(
        Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2)
    )
}

/**
 * Returns a k array of random centers to be used for clustering
 * 
 * @param {Integer} k 
 * @param {Array<Array<Integer>>} colors Linear array of each images pixel
 */
function getRandomKCenters(k, colors) {
    return lodash.sampleSize(colors, k);
}

/**
 * Same a clusterize below. But using the k-mean clusterize library.
 * You can use this for a better implementation of KMeans
 * 
 * The other clusterize() function below is greatly simplified for educational purposes.
 * 
 * @param {*} k 
 * @param {*} data 
 */
function clusterizeUsingKMeansLibrary(k, data) {
    return new Promise((resolve, reject) => {
        kMean.clusterize(data, { k }, (err, clusterResult) => {
            if (err) {
                console.log(err)
                return reject(err)
            }
            for(let i = 0; i < clusterResult.length; i++) {
                let cluster = clusterResult[i].centroid
                let clusterIdx = clusterResult[i].clusterInd
                for (let j = 0; j < clusterIdx.length; j++) {
                    // change each data item to their respective clusters
                    data[clusterIdx[j]] = cluster
                }
            }
            resolve(data)
        })
    })
}

/**
 * Performs k means clustering on the data points
 * data should be an array of data points.
 * 
 * It returns an array of same length as data, but with each entry replaced by its cluster points.
 * 
 * @param {Integer} k 
 * @param {Array<Array<Integer>>} colors 
 */
function quantize(k, colors) {
    if (k > colors.length) {
        throw Error(`K (${k}) is greater than colors (${colors.length}).`)
    }

    const centers = getRandomKCenters(k, colors)

    const centerDistances = new Array(k)
    for(let i = 0; i < colors.length; i++) {
        for(let j = 0; j < centers.length; j++) {
            centerDistances[j] = distance(centers[j],  colors[i])
        }
        const minimumDistance = Math.min(...centerDistances)
        const closestCentersIndex = centerDistances.indexOf(minimumDistance)
        colors[i] = centers[closestCentersIndex]
    }

    return colors
}

async function performKMeansQuantization(k, imagePath) {
    console.log('Extracting Image data')

    const { image, data } = await extractImageData(imagePath)

    console.log('Done extracting image data')

    const { width, height } = image.bitmap

    console.log('Performing K Means Clustering')

    const clusteredData = await quantize(k, data)

    console.log('Done performing K Means Clustering')
    
    console.log('Saving clustered image data to file')

    await saveImageData(image, clusteredData)

    console.log('Done saving image')
}

function printHelp() {
    console.log('This is help being printed. Specify a path to your image as the only argument')
}

function main() {
    const cliOptions = [
        { name: 'imagePath', type: String, defaultOption: true },
        { name: 'k', type: Number, alias: 'k'}
    ]
    const { imagePath = '', k = 24 } = cliArgs(cliOptions)
    if (imagePath === '') {
        return printHelp()
    }
    
    console.log('Starting Image Quantization.')
    performKMeansQuantization(k, imagePath)
        .then(() => {
            console.log('Image Quantization done.')
        })
        .catch(err => {
            console.log(err)
        })
}

main()